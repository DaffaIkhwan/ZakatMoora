import os

count = 0
for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx'):
            f = os.path.join(root, file)
            try:
                with open(f, 'r', encoding='utf-8') as file_obj:
                    content = file_obj.read()
                
                # Check for the literal string
                if 'max-w-[580px]' in content:
                    content = content.replace('max-w-[580px]', 'max-w-[700px]')
                    with open(f, 'w', encoding='utf-8') as file_obj:
                        file_obj.write(content)
                    count += 1
                    print(f'Updated {f}')
            except Exception as e:
                print(f'Error on {f}: {e}')

print(f'Total files updated: {count}')
