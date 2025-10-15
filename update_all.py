#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Update Zalopay CS Knowledge Base - Using Direct API Calls
"""

import os
import json
import pandas as pd
import time
import requests
from pathlib import Path

def generate_embedding_direct_api(text, api_key):
    """Generate embedding using direct API call (no OpenAI library needed)"""
    url = "https://api.openai.com/v1/embeddings"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "text-embedding-3-small",
        "input": text,
        "encoding_format": "float"
    }
    
    response = requests.post(url, headers=headers, json=data, timeout=30)
    
    if response.status_code == 200:
        return response.json()['data'][0]['embedding']
    else:
        raise Exception(f"API Error {response.status_code}: {response.text}")


def update_from_excel():
    """Main update function"""
    print("🚀 Starting update...\n")
    
    # Check Excel file
    if not os.path.exists('DB_ZaloPay_CS.xlsx'):
        print("❌ File DB_ZaloPay_CS.xlsx not found!")
        return False
    
    # Check API key
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ OPENAI_API_KEY not set!")
        print("Set it with: set OPENAI_API_KEY=your_key")
        return False
    
    try:
        # ===== STEP 1: CONVERT EXCEL TO JSON =====
        print("📖 Reading Excel...")
        kb_df = pd.read_excel('DB_ZaloPay_CS.xlsx', sheet_name='Knowledge_Extracts')
        tpl_df = pd.read_excel('DB_ZaloPay_CS.xlsx', sheet_name='Response_Templates')
        
        # Create knowledge base
        knowledge_base = []
        for idx, row in kb_df.iterrows():
            case = {
                "id": f"KB{str(idx+1).zfill(3)}",
                "errorCode": str(row['errorCode']),
                "title": str(row['title']),
                "product": str(row['product']),
                "feature": str(row['feature']),
                "scope": str(row['scope']),
                "severity": str(row['severity']),
                "cause": str(row['cause']),
                "solution": str(row['solution']),
                "notes": str(row.get('notes', '')),
                "sopLink": str(row.get('linkSOP', '')),
                "sopFile": str(row.get('fileSOP', '')),
                "sourceType": str(row.get('sourceType', 'Internal SOP'))
            }
            knowledge_base.append(case)
        
        print(f"✅ Converted {len(knowledge_base)} cases")
        
        # Create template mapping
        template_to_error = {}
        for _, row in kb_df.iterrows():
            template_code = str(row.get('template_vi', ''))
            error_code = str(row['errorCode'])
            if template_code and template_code != 'nan':
                template_to_error[template_code] = error_code
        
        # Create templates
        templates_dict = {}
        for _, row in tpl_df.iterrows():
            template_code = str(row['template_code'])
            channel = str(row['channel'])
            tone = str(row.get('tone', row.get('emotion_mode', 'neutral')))
            body = str(row['template_body'])
            
            # Get error code
            error_code = template_to_error.get(template_code)
            if not error_code:
                parts = template_code.split('_')
                if len(parts) >= 4:
                    error_code = f"{parts[1]}_{parts[2]}_{parts[3]}"
                else:
                    continue
            
            # Initialize template structure
            if error_code not in templates_dict:
                templates_dict[error_code] = {
                    'neutral': {'inapp': '', 'livechat': '', 'email': ''},
                    'angry': {'inapp': '', 'livechat': '', 'email': ''}
                }
            
            # Map channel and tone
            channel_map = {
                'inapp': 'inapp',
                'chat': 'livechat',
                'call': 'livechat',
                'email': 'email'
            }
            tone_map = {
                'neutral': 'neutral',
                'calming': 'angry',
                'angry': 'angry'
            }
            
            mapped_channel = channel_map.get(channel, 'inapp')
            mapped_tone = tone_map.get(tone, 'neutral')
            
            templates_dict[error_code][mapped_tone][mapped_channel] = body
        
        # Fill missing templates
        for error_code in templates_dict:
            for tone in ['neutral', 'angry']:
                for channel in ['inapp', 'livechat', 'email']:
                    if not templates_dict[error_code][tone][channel]:
                        fallback = templates_dict[error_code][tone].get('inapp', '')
                        templates_dict[error_code][tone][channel] = fallback or "Template chưa có"
        
        print(f"✅ Converted {len(templates_dict)} templates")
        
        # Save JSON files
        output_dir = Path('public/data')
        output_dir.mkdir(parents=True, exist_ok=True)
        
        with open(output_dir / 'knowledge_base.json', 'w', encoding='utf-8') as f:
            json.dump(knowledge_base, f, ensure_ascii=False, indent=2)
        
        with open(output_dir / 'templates.json', 'w', encoding='utf-8') as f:
            json.dump(templates_dict, f, ensure_ascii=False, indent=2)
        
        print("✅ Saved JSON files\n")
        
        # ===== STEP 2: GENERATE EMBEDDINGS USING DIRECT API =====
        print("🧠 Generating embeddings using Direct API...")
        print("💡 No OpenAI library needed - using requests!\n")
        
        embeddings = []
        success_count = 0
        
        for i, item in enumerate(knowledge_base):
            try:
                text = f"{item['errorCode']} {item['title']} {item['product']} {item['feature']} {item['cause']} {item['solution']}"
                print(f"[{i+1}/{len(knowledge_base)}] {item['errorCode']}...", end=" ")
                
                embedding = generate_embedding_direct_api(text, api_key)
                embeddings.append(embedding)
                success_count += 1
                print("✅")
                
                # Rate limiting
                time.sleep(0.3)
                
            except Exception as e:
                print(f"❌ {str(e)[:50]}")
                embeddings.append(None)
        
        # Save embeddings
        with open(output_dir / 'embeddings.json', 'w', encoding='utf-8') as f:
            json.dump(embeddings, f, indent=2)
        
        file_size = (output_dir / 'embeddings.json').stat().st_size / (1024 * 1024)
        
        print(f"\n✅ Generated {success_count}/{len(knowledge_base)} embeddings")
        print(f"💾 Saved to embeddings.json ({file_size:.2f} MB)")
        print("\n🎉 Update complete!")
        print("\n📁 Generated files:")
        print("   - public/data/knowledge_base.json")
        print("   - public/data/templates.json")
        print("   - public/data/embeddings.json")
        print("\n🔥 Refresh your browser (Ctrl+F5) to see changes!")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == '__main__':
    update_from_excel()