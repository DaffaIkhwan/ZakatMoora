import os, glob, json, urllib.parse

def recover_files():
    appdata = os.environ.get('APPDATA')
    if not appdata: return

    editors = ['Code', 'Cursor', 'Trae']
    target_files = []
    
    for root, dirs, files in os.walk('src'):
        for f in files:
            if f.endswith('.tsx') and os.path.getsize(os.path.join(root, f)) == 0:
                tf = os.path.abspath(os.path.join(root, f)).replace('\\', '/').lower()
                target_files.append(tf)

    if not target_files:
        print("Done. No 0 byte files found.")
        return

    for editor in editors:
        history_dir = os.path.join(appdata, editor, 'User', 'History')
        if not os.path.exists(history_dir): continue
        
        for entry_file in glob.glob(os.path.join(history_dir, '*', 'entries.json')):
            try:
                with open(entry_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                raw_res = data.get('resource', '')
                if raw_res.startswith('file:///'): raw_res = raw_res[8:]
                resource = urllib.parse.unquote(raw_res).replace('\\', '/').lower()
                
                # Cek target
                for t in target_files[:]:
                    if t == resource or resource.endswith(t):
                        entries = data.get('entries', [])
                        if not entries: continue
                        
                        entries.sort(key=lambda x: x.get('id', 0), reverse=True)
                        for entry in entries:
                            backup_id = entry.get('id')
                            file_path = os.path.join(os.path.dirname(entry_file), str(backup_id))
                            if os.path.exists(file_path):
                                size = os.path.getsize(file_path)
                                if size > 0:
                                    print(f"Recovered {t} from {file_path}")
                                    with open(file_path, 'r', encoding='utf-8') as src: content = src.read()
                                    with open(t, 'w', encoding='utf-8') as dst: dst.write(content)
                                    target_files.remove(t)
                                    break
            except Exception as e:
                pass

if __name__ == "__main__":
    recover_files()
