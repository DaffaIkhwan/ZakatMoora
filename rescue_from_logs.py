import os, glob, re

def rescue_files():
    appdata = os.path.join(os.environ.get('USERPROFILE', ''), '.gemini', 'antigravity', 'brain')
    if not os.path.exists(appdata):
        print(f"Brain dir not found: {appdata}")
        return

    # Find 0 byte files
    target_files = []
    for root, dirs, files in os.walk('src'):
        for f in files:
            if f.endswith('.tsx') and os.path.getsize(os.path.join(root, f)) == 0:
                target_files.append(os.path.abspath(os.path.join(root, f)))

    if not target_files:
        print("No 0 byte files.")
        return

    print(f"Attempting to rescue {len(target_files)} files from Antigravity logs...")

    # For each log file
    log_files = glob.glob(os.path.join(appdata, '*', '.system_generated', 'logs', 'overview.txt'))
    print(f"Scanning {len(log_files)} log files...")
    
    file_contents = {}

    for log_path in log_files:
        try:
            with open(log_path, 'r', encoding='utf-8') as f:
                content = f.read()

            for t in target_files:
                basename = os.path.basename(t)
                
                # Search for view_file output format
                # Usually: File Path: `.../MuzakkiManagement.tsx`\nTotal Lines: ...\nShowing lines 1 to ...\nThe following code has been modified ...\n1: line1\n2: line2\n...\nThe above content shows the entire
                pattern = r"File Path: `[^`]*?/" + re.escape(basename) + r"`.*?Showing lines 1 to \d+\n.*?format: <line_number>: <original_line>.*?\n(1:.*?)\nThe above content shows the entire, complete file contents"
                match = re.search(pattern, content, re.DOTALL | re.IGNORECASE)
                if match:
                    extracted = match.group(1)
                    # Clean up "1: ", "2: " prefixes
                    lines = extracted.split('\n')
                    clean_lines = []
                    for line in lines:
                        clean_lines.append(re.sub(r'^\d+:\s?', '', line))
                    
                    full_text = '\n'.join(clean_lines)
                    
                    if len(full_text) > file_contents.get(t, (0, ''))[0]:
                        file_contents[t] = (len(full_text), full_text)
                    print(f"Found full content for {basename} in {os.path.basename(os.path.dirname(os.path.dirname(os.path.dirname(log_path))))}")
        except Exception as e:
            # print(e)
            pass

    for t, (length, text) in file_contents.items():
        try:
            with open(t, 'w', encoding='utf-8') as f:
                f.write(text)
            print(f"Recovered {os.path.basename(t)} ({length} chars)")
            target_files.remove(t)
        except: pass

    if target_files:
        print("Missing:")
        for t in target_files:
            print("- " + os.path.basename(t))

if __name__ == '__main__':
    rescue_files()
