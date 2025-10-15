import os
import json
import time
import openai

print("=" * 60)
print("🚀 ZALOPAY CS - GENERATE EMBEDDINGS SCRIPT")
print("=" * 60)

# Đọc API key từ .env.local
def load_api_key():
    env_files = ['.env.local', '.env']
    
    for env_file in env_files:
        try:
            with open(env_file, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line.startswith('#') or not line:
                        continue
                    
                    if 'OPENAI_API_KEY' in line:
                        parts = line.split('=', 1)
                        if len(parts) == 2:
                            key = parts[1].strip()
                            print(f"✅ Đã load API key từ {env_file}")
                            return key
        except FileNotFoundError:
            continue
    
    print("❌ Không tìm thấy file .env.local!")
    exit()

# Load API key
api_key = load_api_key()

if not api_key or not api_key.startswith('sk-'):
    print("❌ API key không hợp lệ!")
    exit()

# Set API key
openai.api_key = api_key
print("✅ Đã khởi tạo OpenAI client")

# Load knowledge base
kb_path = 'public/data/knowledge_base.json'

try:
    with open(kb_path, 'r', encoding='utf-8') as f:
        knowledge_base = json.load(f)
    print(f"✅ Đã load {len(knowledge_base)} cases từ {kb_path}")
except FileNotFoundError:
    print(f"❌ Không tìm thấy file {kb_path}!")
    exit()

print("\n" + "=" * 60)
print("🤖 BẮT ĐẦU GENERATE EMBEDDINGS")
print("=" * 60)
print(f"Model: text-embedding-ada-002")
print(f"Tổng số cases: {len(knowledge_base)}")
print(f"Ước tính thời gian: ~{len(knowledge_base) * 0.3:.0f} giây")
print("=" * 60 + "\n")

# Generate embeddings
embeddings = []
success_count = 0
error_count = 0
start_time = time.time()

for i, item in enumerate(knowledge_base):
    try:
        # Ghép text
        text_parts = [
            item.get('errorCode', ''),
            item.get('title', ''),
            item.get('product', ''),
            item.get('feature', ''),
            item.get('cause', ''),
            item.get('solution', ''),
            item.get('notes', '')
        ]
        
        text = ' '.join([str(part) for part in text_parts if part])
        
        # Log progress
        progress = (i + 1) / len(knowledge_base) * 100
        print(f"[{i+1}/{len(knowledge_base)}] ({progress:.1f}%) {item.get('errorCode', 'N/A')}: {item.get('title', '')[:50]}...")
        
        # Gọi OpenAI API (version 0.28)
        response = openai.Embedding.create(
            model='text-embedding-ada-002',
            input=text
        )
        
        embedding = response['data'][0]['embedding']
        embeddings.append(embedding)
        success_count += 1
        
        print(f"   ✅ Success! (Vector: {len(embedding)} dimensions)\n")
        
        # Rate limiting
        time.sleep(0.2)
        
    except Exception as e:
        print(f"   ❌ Error: {e}\n")
        embeddings.append(None)
        error_count += 1
        time.sleep(0.5)

# Lưu embeddings
output_path = 'public/data/embeddings.json'

try:
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(embeddings, f, indent=2)
    
    elapsed_time = time.time() - start_time
    file_size = os.path.getsize(output_path) / 1024 / 1024
    
    print("=" * 60)
    print("🎉 HOÀN THÀNH!")
    print("=" * 60)
    print(f"✅ Thành công: {success_count}/{len(knowledge_base)} cases")
    if error_count > 0:
        print(f"❌ Lỗi: {error_count} cases")
    print(f"⏱️  Thời gian: {elapsed_time:.1f} giây")
    print(f"💾 File size: {file_size:.2f} MB")
    print(f"📂 Saved to: {output_path}")
    print("=" * 60)
    
    print("\n🚀 BẠN CÓ THỂ CHẠY APP NGAY BÂY GIỜ:")
    print("   npm run dev")
    print("\n✨ Semantic search với OpenAI đã sẵn sàng!")
    
except Exception as e:
    print(f"\n❌ Lỗi khi lưu file: {e}")