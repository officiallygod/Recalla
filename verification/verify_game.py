from playwright.sync_api import sync_playwright
import time

def verify_game():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        print("Navigating to home page...")
        page.goto("http://localhost:5173/Recalla/")

        # Wait for the page to load
        page.wait_for_selector("text=Recalla")

        print("Clicking Start Learning...")
        # Start Learning button might be icon or text.
        # Home page has "Start Learning" button.
        start_btn = page.get_by_text("Start Learning")
        if start_btn.count() > 0:
            start_btn.click()
        else:
            # Maybe it's an icon button or named differently
            # Let's try to find a button that navigates to /welcome
            # Or just go to /welcome directly
            print("Start button not found, navigating directly to /welcome")
            page.goto("http://localhost:5173/Recalla/welcome")

        # Wait for topics to load
        print("Waiting for topics...")
        page.wait_for_selector("text=German Words", timeout=10000)

        # Find the Play button for German Words
        # It's inside a card.
        # The topic card has a "Play" button if count >= 4.
        # German Words has 18 words.

        print("Clicking Play...")
        # We need to find the specific play button.
        # It's a button with text "Play".
        play_btn = page.get_by_role("button", name="Play").first
        play_btn.click()

        # Wait for game to load (cards to appear)
        print("Waiting for game to load...")
        page.wait_for_selector(".grid", timeout=10000)

        # Wait a bit for animations to settle
        time.sleep(2)

        print("Taking screenshot...")
        page.screenshot(path="verification/game_screenshot.png")

        browser.close()
        print("Done.")

if __name__ == "__main__":
    verify_game()
