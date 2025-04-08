#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Futurepedia Multi-Category Tools Scraper

This script scrapes AI tools data from multiple Futurepedia category pages
and saves it to a CSV file. It handles pagination for each category.
"""

import os
import time
import requests
import csv
import re
import json
from bs4 import BeautifulSoup
from datetime import datetime
from urllib.parse import urljoin
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# Constants
BASE_URL = "https://www.futurepedia.io"
OUTPUT_DIR = "output"
OUTPUT_FILE = f"futurepedia_all_categories_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

# List of all category URLs to scrape
CATEGORY_URLS = [
    "https://www.futurepedia.io/ai-tools/productivity",
    "https://www.futurepedia.io/ai-tools/personal-assistant",
    "https://www.futurepedia.io/ai-tools/presentations",
    "https://www.futurepedia.io/ai-tools/translators",
    "https://www.futurepedia.io/ai-tools/spreadsheet-assistant",
    "https://www.futurepedia.io/ai-tools/research-assistant",
    "https://www.futurepedia.io/ai-tools/video-enhancer",
    "https://www.futurepedia.io/ai-tools/video-editing",
    "https://www.futurepedia.io/ai-tools/video-generators",
    "https://www.futurepedia.io/ai-tools/text-to-video",
    "https://www.futurepedia.io/ai-tools/prompt-generators",
    "https://www.futurepedia.io/ai-tools/writing-generators",
    "https://www.futurepedia.io/ai-tools/paraphrasing",
    "https://www.futurepedia.io/ai-tools/storyteller",
    "https://www.futurepedia.io/ai-tools/copywriting-assistant",
    "https://www.futurepedia.io/ai-tools/website-builders",
    "https://www.futurepedia.io/ai-tools/marketing",
    "https://www.futurepedia.io/ai-tools/finance",
    "https://www.futurepedia.io/ai-tools/project-management",
    "https://www.futurepedia.io/ai-tools/social-media",
    "https://www.futurepedia.io/ai-tools/design-generators",
    "https://www.futurepedia.io/ai-tools/image-generators",
    "https://www.futurepedia.io/ai-tools/image-editing",
    "https://www.futurepedia.io/ai-tools/text-to-image",
    "https://www.futurepedia.io/ai-tools/workflows",
    "https://www.futurepedia.io/ai-tools/ai-agents",
    "https://www.futurepedia.io/ai-tools/cartoon-generators",
    "https://www.futurepedia.io/ai-tools/portrait-generators",
    "https://www.futurepedia.io/ai-tools/avatar-generator",
    "https://www.futurepedia.io/ai-tools/logo-generator",
    "https://www.futurepedia.io/ai-tools/3D-generator",
    "https://www.futurepedia.io/ai-tools/audio-editing",
    "https://www.futurepedia.io/ai-tools/text-to-speech",
    "https://www.futurepedia.io/ai-tools/music-generator",
    "https://www.futurepedia.io/ai-tools/transcriber",
    "https://www.futurepedia.io/ai-tools/fitness",
    "https://www.futurepedia.io/ai-tools/religion",
    "https://www.futurepedia.io/ai-tools/students",
    "https://www.futurepedia.io/ai-tools/fashion-assistant",
    "https://www.futurepedia.io/ai-tools/gift-ideas",
    "https://www.futurepedia.io/ai-tools/code-assistant",
    "https://www.futurepedia.io/ai-tools/no-code",
    "https://www.futurepedia.io/ai-tools/sql-assistant"
]

def create_output_dir():
    """Create output directory if it doesn't exist."""
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        print(f"Created output directory: {OUTPUT_DIR}")

def setup_selenium():
    """Set up Selenium WebDriver with Chrome."""
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run in headless mode
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920x1080")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-extensions")
    
    # Set user agent
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
    
    driver = webdriver.Chrome(options=chrome_options)
    return driver

def save_html_for_debugging(html_content, filename="debug_output.html"):
    """Save HTML content to a file for debugging."""
    debug_path = os.path.join(OUTPUT_DIR, filename)
    with open(debug_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    print(f"Saved HTML content to {debug_path} for debugging")

def get_page_with_pagination(url):
    """Get the page content with proper pagination handling."""
    print(f"Setting up browser to scrape: {url}")
    driver = setup_selenium()
    
    all_tools_data = []
    page_num = 1
    
    try:
        while True:
            # Construct the URL for the current page
            current_url = url if page_num == 1 else f"{url}?page={page_num}"
            print(f"Loading page {page_num}: {current_url}")
            
            driver.get(current_url)
            print("Page loaded successfully")
            
            # Wait for the grid to load
            try:
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, ".grid.grid-cols-1.gap-4"))
                )
            except TimeoutException:
                print("Timeout waiting for grid to load. Page might be empty or have a different structure.")
                break
            
            # Initial count of tool cards
            initial_tool_count = len(driver.find_elements(By.CSS_SELECTOR, ".flex.flex-col.bg-card.text-card-foreground.h-full.w-full.rounded-xl.border.shadow-lg"))
            print(f"Initially found {initial_tool_count} tool cards on page {page_num}")
            
            if initial_tool_count == 0:
                print("No tool cards found on this page. Moving to next category or finishing.")
                break
                
            # Extract tools from the current page
            page_html = driver.page_source
            tools_data = extract_tools_from_html(page_html, url)
            
            if tools_data:
                all_tools_data.extend(tools_data)
                print(f"Extracted {len(tools_data)} tools from page {page_num}")
            else:
                print(f"No tools extracted from page {page_num}")
            
            # Check if there's a next page using the pagination elements
            try:
                # Look for the pagination container
                pagination_container = driver.find_element(By.CSS_SELECTOR, "div.flex.items-center.justify-center.py-12")
                
                # Find the "Next" button
                next_page_button = pagination_container.find_element(By.CSS_SELECTOR, "a[aria-label='Next']")
                
                # Check if the Next button is disabled
                if "cursor-default" in next_page_button.get_attribute("class") or "opacity-50" in next_page_button.get_attribute("class"):
                    print("Next page button is disabled. Reached the last page.")
                    break
                
                # Get the href attribute to navigate to the next page
                next_page_url = next_page_button.get_attribute("href")
                if not next_page_url:
                    print("No next page URL found. Reached the last page.")
                    break
                
                # Extract page number from URL
                page_match = re.search(r'page=(\d+)', next_page_url)
                if page_match:
                    page_num = int(page_match.group(1))
                else:
                    page_num += 1
                
                print(f"Moving to page {page_num}")
                
            except NoSuchElementException:
                print("No pagination found or reached the last page")
                break
            except Exception as e:
                print(f"Error checking pagination: {e}")
                break
        
        print(f"Successfully scraped {len(all_tools_data)} tools from category: {url}")
        return all_tools_data
        
    except Exception as e:
        print(f"Error while loading page: {e}")
        return all_tools_data
    finally:
        driver.quit()

def extract_tools_from_html(html_content, category_url):
    """Extract tools from the HTML content."""
    if not html_content:
        return []
    
    soup = BeautifulSoup(html_content, 'lxml')
    tools_data = []
    
    # Extract category name from URL
    category_name = category_url.split('/')[-1].replace('-', ' ').title()
    
    # Find all tool cards
    tool_cards = soup.select('.flex.flex-col.bg-card.text-card-foreground.h-full.w-full.rounded-xl.border.shadow-lg')
    print(f"Found {len(tool_cards)} tool cards in HTML")
    
    for card in tool_cards:
        try:
            # Extract tool name
            name_element = card.select_one('p.m-0.line-clamp-2.overflow-hidden.text-xl.font-semibold.text-slate-700')
            name = name_element.text.strip() if name_element else "Unknown Tool"
            
            # Extract tool URL - look for link to tool page
            link_element = None
            for a in card.find_all('a', href=True):
                if '/tool/' in a['href']:
                    link_element = a
                    break
            
            tool_url = urljoin(BASE_URL, link_element['href']) if link_element else "N/A"
            
            # Extract description
            description_element = card.select_one('p.text-muted-foreground.my-2.line-clamp-2.overflow-hidden.overflow-ellipsis.px-6.text-base')
            description = description_element.text.strip() if description_element else "No description available"
            
            # Extract pricing
            pricing_element = card.select_one('div.flex.justify-between.text-lg span:first-child')
            pricing = pricing_element.text.strip() if pricing_element else "N/A"
            
            # Extract categories - look for links in the category area
            category_elements = card.select('div.px-6.mb-6.flex.flex-wrap.gap-1.py-2 a')
            categories = []
            for cat in category_elements:
                if cat.text.startswith('#'):
                    categories.append(cat.text[1:])  # Remove the # symbol
                else:
                    categories.append(cat.text)
            
            # Extract rating if available
            rating_text = "N/A"
            rating_container = card.select_one('div.flex.items-center.gap-2.text-lg')
            if rating_container:
                rating_span = rating_container.select_one('span.sr-only')
                if rating_span:
                    rating_match = re.search(r'Rated ([\d.]+) out of 5', rating_span.text)
                    if rating_match:
                        rating_text = rating_match.group(1)
            
            # Extract external URL (Visit button)
            external_url = "N/A"
            visit_link = card.select_one('a[rel="nofollow"][target="_blank"]')
            if visit_link and 'href' in visit_link.attrs:
                external_url = visit_link['href']
            
            # Extract tool image URL
            image_url = "N/A"
            img_element = card.select_one('img[alt$="logo"]')
            if img_element and 'src' in img_element.attrs:
                image_url = img_element['src']
            
            # Check if it's an editor's pick
            is_editors_pick = False
            editors_pick_element = card.select_one('.tool-label svg.lucide-award')
            if editors_pick_element:
                is_editors_pick = True
            
            # Extract bookmark count if available
            bookmark_count = "0"
            bookmark_element = card.select_one('div.flex.justify-between.text-lg span.flex.items-center.text-slate-500 span.mr-1')
            if bookmark_element:
                bookmark_count = bookmark_element.text.strip()
            
            tool_data = {
                'Name': name,
                'URL': tool_url,
                'Description': description,
                'Categories': ', '.join(categories) if categories else "N/A",
                'Pricing': pricing,
                'Rating': rating_text,
                'External_URL': external_url,
                'Image_URL': image_url,
                'Editors_Pick': "Yes" if is_editors_pick else "No",
                'Bookmark_Count': bookmark_count,
                'Source_Category': category_name
            }
            
            print(f"Extracted data for tool: {name}")
            tools_data.append(tool_data)
            
        except Exception as e:
            print(f"Error extracting data from tool card: {e}")
    
    return tools_data

def scrape_all_categories():
    """Scrape all tools from all category pages."""
    print("Starting to scrape Futurepedia All Categories...")
    
    all_tools_data = []
    
    for category_url in CATEGORY_URLS:
        print(f"\nProcessing category: {category_url}")
        category_tools = get_page_with_pagination(category_url)
        all_tools_data.extend(category_tools)
        print(f"Total tools collected so far: {len(all_tools_data)}")
    
    print(f"\nFound {len(all_tools_data)} tools across all categories")
    
    return all_tools_data

def save_to_csv(data, filename):
    """Save the scraped data to a CSV file."""
    if not data:
        print("No data to save")
        return
        
    output_path = os.path.join(OUTPUT_DIR, filename)
    
    with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['Name', 'URL', 'Description', 'Categories', 'Pricing', 
                      'Rating', 'External_URL', 'Image_URL', 'Editors_Pick', 'Bookmark_Count', 'Source_Category']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        writer.writeheader()
        for item in data:
            writer.writerow(item)
            
    print(f"Data saved to: {output_path}")

def main():
    """Main function to run the scraper."""
    print("Futurepedia Multi-Category Tools Scraper")
    print("=======================================")
    
    # Create output directory
    create_output_dir()
    
    # Scrape data from all categories
    tools_data = scrape_all_categories()
    
    # Save data to CSV
    save_to_csv(tools_data, OUTPUT_FILE)
    
    print("\nScraping completed!")

if __name__ == "__main__":
    main() 