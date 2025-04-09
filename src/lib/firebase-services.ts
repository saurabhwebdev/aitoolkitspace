import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  Timestamp,
  serverTimestamp,
  increment,
  QueryConstraint,
  startAfter
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';
import { Tool, BlogPost, Category, Feedback, ToolReport, ToolCategory, ToolStatus, Bookmark, Contact } from './models';
import { auth } from './firebase';

// --- TOOLS CRUD OPERATIONS ---

// Get all tools
export const getAllTools = async (page = 1, pageSize = 9, filters = {
  category: 'all',
  status: 'all',
  searchTerm: '',
  sortBy: 'createdAt',
  sortOrder: 'desc'
}) => {
  const toolsRef = collection(db, 'tools');
  let queryConstraints: QueryConstraint[] = [];
  
  // Add filters if provided
  if (filters.category && filters.category !== 'all') {
    queryConstraints.push(where('category', '==', filters.category));
  }
  
  if (filters.status && filters.status !== 'all') {
    queryConstraints.push(where('status', '==', filters.status));
  }

  // Handle search term using a compound query approach
  if (filters.searchTerm) {
    const searchTerm = filters.searchTerm.toLowerCase();
    // Create an array of searchable fields
    const searchableFields = ['name', 'description', 'tags'];
    
    // Add a compound query for each searchable field
    const searchQueries = searchableFields.map(field => {
      const fieldConstraints = [...queryConstraints];
      fieldConstraints.push(where(field, '>=', searchTerm));
      fieldConstraints.push(where(field, '<=', searchTerm + '\uf8ff'));
      return query(toolsRef, ...fieldConstraints);
    });

    // Execute all search queries in parallel
    const searchResults = await Promise.all(
      searchQueries.map(q => getDocs(q))
    );

    // Combine and deduplicate results
    const resultsMap = new Map();
    searchResults.forEach(snapshot => {
      snapshot.docs.forEach(doc => {
        if (!resultsMap.has(doc.id)) {
          const data = doc.data();
          resultsMap.set(doc.id, {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          } as Tool);
        }
      });
    });

    // Convert map to array and sort
    let results = Array.from(resultsMap.values());
    
    // Apply sorting
    const sortField = filters.sortBy || 'createdAt';
    const sortDirection = filters.sortOrder === 'asc' ? 'asc' : 'desc';
    results.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      return sortDirection === 'asc' 
        ? (aValue > bValue ? 1 : -1)
        : (aValue < bValue ? 1 : -1);
    });

    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return results.slice(startIndex, endIndex);
  }
  
  // If no search term, use regular query with sorting and pagination
  const sortField = filters.sortBy || 'createdAt';
  const sortDirection = filters.sortOrder === 'asc' ? 'asc' : 'desc';
  
  queryConstraints.push(orderBy(sortField, sortDirection));
  
  // Apply pagination
  if (page > 1) {
    const startAfterDoc = await getStartAfterDoc(page, pageSize, queryConstraints);
    if (startAfterDoc) {
      queryConstraints.push(startAfter(startAfterDoc));
    }
  }
  
  queryConstraints.push(limit(pageSize));
  
  const q = query(toolsRef, ...queryConstraints);
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    } as Tool;
  });
};

// Helper function to get the document to start after for pagination with filters
const getStartAfterDoc = async (page: number, pageSize: number, queryConstraints: QueryConstraint[] = []) => {
  const toolsRef = collection(db, 'tools');
  // Create a copy of constraints without the startAfter and limit
  const constraints = [...queryConstraints].filter(
    constraint => !constraint.toString().includes('startAfter') && !constraint.toString().includes('limit')
  );
  
  // Add limit for pagination
  constraints.push(limit((page - 1) * pageSize));
  
  const q = query(toolsRef, ...constraints);
  const snapshot = await getDocs(q);
  
  if (snapshot.empty || snapshot.docs.length < (page - 1) * pageSize) {
    return null;
  }
  
  return snapshot.docs[snapshot.docs.length - 1];
};

// Get total count of tools for pagination
export const getToolsCount = async (filters = {
  category: 'all',
  status: 'all'
}) => {
  const toolsRef = collection(db, 'tools');
  let queryConstraints: QueryConstraint[] = [];
  
  // Add filters if provided
  if (filters.category && filters.category !== 'all') {
    queryConstraints.push(where('category', '==', filters.category));
  }
  
  if (filters.status && filters.status !== 'all') {
    queryConstraints.push(where('status', '==', filters.status));
  }
  
  const q = query(toolsRef, ...queryConstraints);
  const snapshot = await getDocs(q);
  return snapshot.size;
};

// Get featured tools
export const getFeaturedTools = async (): Promise<Tool[]> => {
  try {
    console.log('Fetching featured tools...');
    const toolsRef = collection(db, 'tools');
    const q = query(
      toolsRef,
      where('featured', '==', true),
      where('status', '==', 'active')
    );
    
    const querySnapshot = await getDocs(q);
    console.log(`Found ${querySnapshot.size} featured tools`);
    
    if (querySnapshot.empty) {
      console.log('No featured tools found. Checking all tools for debugging...');
      const allToolsSnapshot = await getDocs(toolsRef);
      let featuredCount = 0;
      let activeCount = 0;
      
      allToolsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.featured === true) featuredCount++;
        if (data.status === 'active') activeCount++;
      });
      
      console.log(`Debug info: ${featuredCount} tools are featured, ${activeCount} tools are active`);
      return [];
    }
    
    const tools: Tool[] = [];
    querySnapshot.forEach(doc => {
      tools.push({ id: doc.id, ...doc.data() } as Tool);
    });
    
    return tools;
  } catch (error) {
    console.error('Error fetching featured tools:', error);
    throw error;
  }
};

// Get tools by category
export const getToolsByCategory = async (category: string, page = 1, pageSize = 20): Promise<Tool[]> => {
  try {
    const toolsRef = collection(db, 'tools');
    let q;
    
    if (page > 1) {
      const startAfterDoc = await getCategoryStartAfterDoc(category, page, pageSize);
      if (startAfterDoc) {
        q = query(
          toolsRef,
          where('category', '==', category),
          where('status', '==', 'ACTIVE'),
          orderBy('createdAt', 'desc'),
          startAfter(startAfterDoc),
          limit(pageSize)
        );
      } else {
        q = query(
          toolsRef,
          where('category', '==', category),
          where('status', '==', 'ACTIVE'),
          orderBy('createdAt', 'desc'),
          limit(pageSize)
        );
      }
    } else {
      // First page
      q = query(
        toolsRef,
        where('category', '==', category),
        where('status', '==', 'ACTIVE'),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        longDescription: data.longDescription,
        imageUrl: data.imageUrl,
        websiteUrl: data.websiteUrl,
        category: data.category,
        subcategory: data.subcategory,
        pricing: data.pricing,
        tags: data.tags || [],
        features: data.features || [],
        pros: data.pros || [],
        cons: data.cons || [],
        alternatives: data.alternatives || [],
        affiliateLink: data.affiliateLink,
        sponsored: data.sponsored || false,
        status: data.status,
        featured: data.featured || false,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        viewCount: data.viewCount || 0,
        rating: data.rating,
        ratingCount: data.ratingCount
      } as Tool;
    });
  } catch (error) {
    console.error('Error getting tools by category:', error);
    throw error;
  }
};

// Helper function to get the start-after document for category pagination
const getCategoryStartAfterDoc = async (category: string, page: number, pageSize: number) => {
  const toolsRef = collection(db, 'tools');
  const q = query(
    toolsRef,
    where('category', '==', category),
    where('status', '==', 'ACTIVE'),
    orderBy('createdAt', 'desc'),
    limit((page - 1) * pageSize)
  );
  
  const snapshot = await getDocs(q);
  
  if (snapshot.empty || snapshot.docs.length < (page - 1) * pageSize) {
    return null;
  }
  
  return snapshot.docs[snapshot.docs.length - 1];
};

// Get total count of tools in a category for pagination
export const getToolsByCategoryCount = async (category: string): Promise<number> => {
  try {
    const toolsRef = collection(db, 'tools');
    const q = query(
      toolsRef,
      where('category', '==', category),
      where('status', '==', 'ACTIVE')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting tools count by category:', error);
    return 0;
  }
};

// Get tool by ID
export const getToolById = async (id: string) => {
  const docRef = doc(db, 'tools', id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    return null;
  }
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date()
  } as Tool;
};

// Get tool by slug
export const getToolBySlug = async (slug: string) => {
  const toolsRef = collection(db, 'tools');
  const q = query(toolsRef, where('slug', '==', slug));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return null;
  }
  const doc = snapshot.docs[0];
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date()
  } as Tool;
};

// Create new tool
export const createTool = async (tool: Omit<Tool, 'id' | 'createdAt' | 'updatedAt'>) => {
  const toolWithDates = {
    ...tool,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  const docRef = await addDoc(collection(db, 'tools'), toolWithDates);
  return docRef.id;
};

// Update tool
export const updateTool = async (id: string, tool: Partial<Tool>) => {
  const toolRef = doc(db, 'tools', id);
  const updates = {
    ...tool,
    updatedAt: serverTimestamp()
  };
  
  await updateDoc(toolRef, updates);
  return id;
};

// Delete tool
export const deleteTool = async (id: string) => {
  await deleteDoc(doc(db, 'tools', id));
  return id;
};

// Increment tool view count
export const incrementToolViewCount = async (id: string) => {
  const toolRef = doc(db, 'tools', id);
  await updateDoc(toolRef, {
    viewCount: increment(1)
  });
};

// --- BLOG POSTS CRUD OPERATIONS ---

// Get all blog posts
export const getBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    // Get blogs from the main collection
    const blogsRef = collection(db, 'blog_posts');
    const q = query(
      blogsRef,
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    
    const mainBlogs = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        slug: data.slug,
        content: data.content,
        summary: data.summary,
        imageUrl: data.imageUrl,
        category: data.category,
        tags: data.tags || [],
        author: data.author,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
        status: data.status || 'DRAFT'
      } as BlogPost;
    });
    
    // Also check the legacy 'blogs' collection
    const legacyBlogsRef = collection(db, 'blogs');
    const legacyQ = query(
      legacyBlogsRef,
      orderBy('createdAt', 'desc')
    );
    
    const legacySnapshot = await getDocs(legacyQ);
    
    const legacyBlogs = legacySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || '',
        slug: data.slug || '',
        content: data.content || '',
        summary: data.summary || '',
        imageUrl: data.imageUrl || '',
        category: data.category || '',
        tags: data.tags || [],
        author: data.author || '',
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
        status: data.published === true ? 'PUBLISHED' : (data.status || 'DRAFT')
      } as BlogPost;
    });
    
    // Combine both collections
    console.log(`Found ${mainBlogs.length} blogs in blog_posts collection and ${legacyBlogs.length} in blogs collection`);
    return [...mainBlogs, ...legacyBlogs];
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
};

// Get featured blog posts
export const getFeaturedBlogPosts = async (limitCount = 3) => {
  // Check both collections for featured blog posts
  
  // First, check the main blog_posts collection
  const mainBlogsRef = collection(db, 'blog_posts');
  const mainQuery = query(
    mainBlogsRef, 
    where('featured', '==', true),
    where('status', '==', 'PUBLISHED'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const mainSnapshot = await getDocs(mainQuery);
  
  const mainFeatured = mainSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date()
    } as BlogPost;
  });
  
  // If we have enough from the main collection, return them
  if (mainFeatured.length >= limitCount) {
    return mainFeatured;
  }
  
  // Otherwise, also check the legacy collection for more featured posts
  const remainingCount = limitCount - mainFeatured.length;
  const legacyBlogsRef = collection(db, 'blogs');
  const legacyQuery = query(
    legacyBlogsRef, 
    where('featured', '==', true),
    where('published', '==', true),
    orderBy('publishedAt', 'desc'),
    limit(remainingCount)
  );
  const legacySnapshot = await getDocs(legacyQuery);
  
  const legacyFeatured = legacySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
      status: 'PUBLISHED' // Ensure status is set for legacy entries
    } as BlogPost;
  });
  
  // Combine both sets of featured posts
  return [...mainFeatured, ...legacyFeatured];
};

// Get blog post by ID
export const getBlogPostById = async (id: string) => {
  // First check the 'blog_posts' collection (primary collection)
  let docRef = doc(db, 'blog_posts', id);
  let docSnap = await getDoc(docRef);
  
  // If found in blog_posts collection, return it
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date()
    } as BlogPost;
  }
  
  // If not found, check the 'blogs' collection (legacy collection)
  docRef = doc(db, 'blogs', id);
  docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date()
    } as BlogPost;
  }
  
  // If not found in either collection, return null
  return null;
};

// Get blog post by slug
export const getBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  try {
    console.log(`Searching for blog post with slug: ${slug}`);
    
    // First check the 'blog_posts' collection (primary collection)
    const blogsRef = collection(db, 'blog_posts');
    const q = query(
      blogsRef,
      where('slug', '==', slug),
      where('status', '==', 'PUBLISHED')
    );
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const data = doc.data();
      console.log(`Found blog post in primary collection: ${data.title}`);
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date()
      } as BlogPost;
    }
    
    // If not found, check the legacy 'blogs' collection
    console.log('Blog not found in primary collection, checking legacy collection');
    const legacyBlogsRef = collection(db, 'blogs');
    const legacyQ = query(
      legacyBlogsRef,
      where('slug', '==', slug),
      where('published', '==', true)
    );
    const legacySnapshot = await getDocs(legacyQ);
    
    if (!legacySnapshot.empty) {
      const doc = legacySnapshot.docs[0];
      const data = doc.data();
      console.log(`Found blog post in legacy collection: ${data.title}`);
      return {
        id: doc.id,
        ...data,
        title: data.title || '',
        content: data.content || '',
        summary: data.summary || data.excerpt || '',
        tags: data.tags || [],
        author: data.author || data.authorName || '',
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
        status: 'PUBLISHED'
      } as BlogPost;
    }
    
    console.log(`No blog post found with slug: ${slug}`);
    return null;
  } catch (error) {
    console.error('Error fetching blog post by slug:', error);
    return null;
  }
};

// Create new blog post
export const createBlogPost = async (post: Omit<BlogPost, 'id'>): Promise<string> => {
  const now = serverTimestamp();
  const postWithDates = {
    ...post,
    createdAt: now,
    updatedAt: now
  };
  
  const docRef = await addDoc(collection(db, 'blog_posts'), postWithDates);
  return docRef.id;
};

// Update blog post
export const updateBlogPost = async (id: string, post: Partial<BlogPost>): Promise<void> => {
  try {
    // Ensure we're updating the correct collection
    const postRef = doc(db, 'blog_posts', id);
    
    // Check if we're changing the featured status
    if (post.featured !== undefined) {
      console.log(`Setting featured status to: ${post.featured}`);
    }
    
    // Check if we're changing publish status
    if (post.status) {
      console.log(`Setting publish status to: ${post.status}`);
    }
    
    const updates = {
      ...post,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(postRef, updates);
    console.log('Blog post updated successfully');
  } catch (error) {
    console.error('Error updating blog post:', error);
    throw error;
  }
};

// Delete blog post
export const deleteBlogPost = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'blog_posts', id));
};

// Increment blog post view count
export const incrementBlogViewCount = async (id: string) => {
  const blogRef = doc(db, 'blogs', id);
  await updateDoc(blogRef, {
    viewCount: increment(1)
  });
};

// --- IMAGE UPLOAD OPERATIONS ---

// Upload image to Firebase Storage
export const uploadImage = async (file: File, path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

// Delete image from Firebase Storage
export const deleteImage = async (path: string) => {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
};

// --- CATEGORIES OPERATIONS ---

// Get all categories
export const getAllCategories = async () => {
  const categoriesRef = collection(db, 'categories');
  const q = query(categoriesRef, orderBy('name', 'asc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Category));
};

// Get category by slug
export const getCategoryBySlug = async (slug: string) => {
  const categoriesRef = collection(db, 'categories');
  const q = query(categoriesRef, where('slug', '==', slug));
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as Category;
  }
  
  return null;
};

// --- FEEDBACK OPERATIONS ---

// Submit feedback
export const submitFeedback = async (feedback: Omit<Feedback, 'id' | 'createdAt' | 'status'>) => {
  const feedbackWithMeta = {
    ...feedback,
    createdAt: serverTimestamp(),
    status: 'new'
  };
  
  const docRef = await addDoc(collection(db, 'feedback'), feedbackWithMeta);
  return docRef.id;
};

// Submit tool report
export const submitToolReport = async (report: Omit<ToolReport, 'id' | 'createdAt' | 'status'>) => {
  const docRef = await addDoc(collection(db, 'toolReports'), {
    ...report,
    createdAt: serverTimestamp(),
    status: 'new'
  });
  return docRef.id;
};

// --- BOOKMARKS ---

// Get user's bookmarks
export const getUserBookmarks = async (userId: string): Promise<Bookmark[]> => {
  try {
    const bookmarksRef = collection(db, 'bookmarks');
    const q = query(
      bookmarksRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        toolId: data.toolId,
        toolName: data.toolName,
        toolImageUrl: data.toolImageUrl,
        notes: data.notes,
        createdAt: data.createdAt
      } as Bookmark;
    });
  } catch (error) {
    console.error('Error getting user bookmarks:', error);
    throw error;
  }
};

// Check if a tool is bookmarked by the user
export const isToolBookmarked = async (userId: string, toolId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    const bookmarksRef = collection(db, 'bookmarks');
    const q = query(
      bookmarksRef,
      where('userId', '==', userId),
      where('toolId', '==', toolId),
      limit(1)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking if tool is bookmarked:', error);
    return false;
  }
};

// Get a specific bookmark
export const getBookmark = async (userId: string, toolId: string): Promise<Bookmark | null> => {
  try {
    const bookmarksRef = collection(db, 'bookmarks');
    const q = query(
      bookmarksRef,
      where('userId', '==', userId),
      where('toolId', '==', toolId),
      limit(1)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      toolId: data.toolId,
      toolName: data.toolName,
      toolImageUrl: data.toolImageUrl,
      notes: data.notes,
      createdAt: data.createdAt
    } as Bookmark;
  } catch (error) {
    console.error('Error getting bookmark:', error);
    return null;
  }
};

// Add a bookmark
export const addBookmark = async (bookmark: Omit<Bookmark, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const bookmarkWithTimestamp = {
      ...bookmark,
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'bookmarks'), bookmarkWithTimestamp);
    return docRef.id;
  } catch (error) {
    console.error('Error adding bookmark:', error);
    throw error;
  }
};

// Remove a bookmark
export const removeBookmark = async (userId: string, toolId: string): Promise<void> => {
  try {
    const bookmark = await getBookmark(userId, toolId);
    
    if (bookmark && bookmark.id) {
      await deleteDoc(doc(db, 'bookmarks', bookmark.id));
    }
  } catch (error) {
    console.error('Error removing bookmark:', error);
    throw error;
  }
};

// Update bookmark notes
export const updateBookmarkNotes = async (bookmarkId: string, notes: string): Promise<void> => {
  try {
    const bookmarkRef = doc(db, 'bookmarks', bookmarkId);
    await updateDoc(bookmarkRef, { 
      notes,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating bookmark notes:', error);
    throw error;
  }
};

// --- SEARCH ---

export async function searchTools(searchQuery: string): Promise<Tool[]> {
  if (!searchQuery.trim()) {
    return [];
  }

  const results: Tool[] = [];
  const lowerQuery = searchQuery.toLowerCase();
  
  try {
    // Get all tools - more efficient for admin search since we need to search across multiple fields
    const toolsRef = collection(db, 'tools');
    const querySnapshot = await getDocs(toolsRef);
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Record<string, any>;
      const name = (data.name || '').toLowerCase();
      const description = (data.description || '').toLowerCase();
      const tags = (data.tags || []).map((tag: string) => tag.toLowerCase());
      
      // Check if search term appears in any of the searchable fields
      if (name.includes(lowerQuery) || 
          description.includes(lowerQuery) ||
          tags.some((tag: string) => tag.includes(lowerQuery))) {
        
        results.push({
          id: doc.id,
          name: data.name,
          slug: data.slug,
          description: data.description,
          longDescription: data.longDescription,
          imageUrl: data.imageUrl,
          websiteUrl: data.websiteUrl,
          category: data.category,
          subcategory: data.subcategory,
          pricing: data.pricing,
          tags: data.tags || [],
          features: data.features || [],
          pros: data.pros || [],
          cons: data.cons || [],
          alternatives: data.alternatives || [],
          affiliateLink: data.affiliateLink,
          sponsored: data.sponsored || false,
          status: data.status,
          featured: data.featured || false,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          viewCount: data.viewCount || 0,
          rating: data.rating,
          ratingCount: data.ratingCount
        } as Tool);
      }
    });
    
    return results;
  } catch (error) {
    console.error('Error searching tools:', error);
    return [];
  }
}

// --- CONTACT FORM ---

// Submit contact form
export const submitContactForm = async (contactData: Omit<Contact, 'id' | 'createdAt' | 'status'>): Promise<string> => {
  try {
    const contactWithMeta = {
      ...contactData,
      createdAt: serverTimestamp(),
      status: 'new'
    };
    
    const docRef = await addDoc(collection(db, 'contacts'), contactWithMeta);
    return docRef.id;
  } catch (error) {
    console.error('Error submitting contact form:', error);
    throw error;
  }
};

// Submit a new tool for admin approval
export const submitTool = async (tool: Partial<Tool>): Promise<string> => {
  try {
    const toolWithDates = {
      ...tool,
      status: ToolStatus.BETA,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      approved: false,
      submittedBy: auth.currentUser?.uid || 'anonymous',
      submittedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'tool_submissions'), toolWithDates);
    return docRef.id;
  } catch (error) {
    console.error('Error submitting tool:', error);
    throw error;
  }
};

// Get submitted tools (for admin)
export const getSubmittedTools = async (): Promise<Tool[]> => {
  try {
    const submissionsRef = collection(db, 'tool_submissions');
    const q = query(
      submissionsRef,
      orderBy('submittedAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Tool));
  } catch (error) {
    console.error('Error getting submitted tools:', error);
    throw error;
  }
};

// Approve a submitted tool
export const approveTool = async (submissionId: string): Promise<void> => {
  try {
    const submissionRef = doc(db, 'tool_submissions', submissionId);
    const submission = await getDoc(submissionRef);
    
    if (!submission.exists()) {
      throw new Error('Submission not found');
    }
    
    const submissionData = submission.data();
    
    // Create the tool in the main tools collection
    const toolData = {
      ...submissionData,
      status: ToolStatus.ACTIVE,
      approved: true,
      approvedAt: serverTimestamp(),
      approvedBy: auth.currentUser?.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    } as any; // Using type assertion to resolve property access issues
    
    // Remove submission-specific fields
    if ('submittedBy' in toolData) delete toolData.submittedBy;
    if ('submittedAt' in toolData) delete toolData.submittedAt;
    if ('approved' in toolData) delete toolData.approved;
    
    await addDoc(collection(db, 'tools'), toolData);
    
    // Delete the submission
    await deleteDoc(submissionRef);
  } catch (error) {
    console.error('Error approving tool:', error);
    throw error;
  }
};

// Reject a submitted tool
export const rejectTool = async (submissionId: string, reason: string): Promise<void> => {
  try {
    const submissionRef = doc(db, 'tool_submissions', submissionId);
    await updateDoc(submissionRef, {
      status: 'rejected',
      rejectedAt: serverTimestamp(),
      rejectedBy: auth.currentUser?.uid,
      rejectionReason: reason
    });
  } catch (error) {
    console.error('Error rejecting tool:', error);
    throw error;
  }
}; 