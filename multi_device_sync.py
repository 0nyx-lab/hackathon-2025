#!/usr/bin/env python3
"""
マルチデバイス・マルチアカウント同期システム

複数のデバイス（メインPC、サブPC）と複数のアカウント（メインアカウント、サブアカウント）
で、AI駆動開発の統合システムを運用するための同期システム
"""

import os
import json
import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from pathlib import Path
import logging

# ログ設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class DeviceInfo:
    """デバイス情報"""
    device_id: str
    device_name: str
    platform: str  # Windows, macOS, Linux
    account: str
    role: str  # main, sub
    last_sync: datetime.datetime
    status: str  # active, inactive, error

@dataclass
class KnowledgeItem:
    """知識アイテム"""
    id: str
    title: str
    content: str
    category: str  # rule, issue, document, implementation
    device_id: str
    created_at: datetime.datetime
    updated_at: datetime.datetime
    tags: List[str]
    priority: int  # 1-5
    status: str  # draft, active, archived

@dataclass
class SyncStatus:
    """同期ステータス"""
    device_id: str
    last_sync: datetime.datetime
    sync_count: int
    error_count: int
    status: str  # success, error, pending

class MultiDeviceSync:
    """マルチデバイス同期システム"""
    
    def __init__(self, config_file: str = "multi_device_config.json"):
        self.config_file = config_file
        self.config = self._load_config()
        self.devices: Dict[str, DeviceInfo] = {}
        self.knowledge_base: List[KnowledgeItem] = []
        self.sync_history: List[SyncStatus] = []
        
    def _load_config(self) -> Dict[str, Any]:
        """設定ファイルの読み込み"""
        if os.path.exists(self.config_file):
            with open(self.config_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        else:
            return self._create_default_config()
    
    def _create_default_config(self) -> Dict[str, Any]:
        """デフォルト設定の作成"""
        default_config = {
            "github_repo": "0nyx-lab/aidd-integration-system",
            "sync_interval": 300,  # 5分
            "max_retries": 3,
            "devices": {
                "main-pc": {
                    "device_name": "Main PC (Windows)",
                    "platform": "Windows",
                    "account": "0nyx-lab",
                    "role": "main"
                },
                "sub-pc": {
                    "device_name": "Sub PC (Mac)",
                    "platform": "macOS",
                    "account": "sub-account",
                    "role": "sub"
                }
            }
        }
        self._save_config(default_config)
        return default_config
    
    def _save_config(self, config: Dict[str, Any]):
        """設定ファイルの保存"""
        with open(self.config_file, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
    
    def register_device(self, device_id: str, device_info: DeviceInfo):
        """デバイスの登録"""
        self.devices[device_id] = device_info
        logger.info(f"Device registered: {device_id} - {device_info.device_name}")
    
    def add_knowledge(self, knowledge: KnowledgeItem):
        """知識の追加"""
        self.knowledge_base.append(knowledge)
        logger.info(f"Knowledge added: {knowledge.id} - {knowledge.title}")
    
    def sync_to_github(self, device_id: str) -> bool:
        """GitHubへの同期"""
        try:
            if device_id not in self.devices:
                raise ValueError(f"Unknown device: {device_id}")
            
            device = self.devices[device_id]
            
            # デバイス固有の知識を取得
            device_knowledge = [
                k for k in self.knowledge_base 
                if k.device_id == device_id and k.status == "active"
            ]
            
            # 同期処理（実際の実装ではGitHub APIを使用）
            sync_data = {
                "device_id": device_id,
                "device_name": device.device_name,
                "platform": device.platform,
                "account": device.account,
                "knowledge_count": len(device_knowledge),
                "sync_time": datetime.datetime.now().isoformat(),
                "knowledge_items": [asdict(k) for k in device_knowledge]
            }
            
            # 同期ステータスの更新
            sync_status = SyncStatus(
                device_id=device_id,
                last_sync=datetime.datetime.now(),
                sync_count=1,
                error_count=0,
                status="success"
            )
            
            self.sync_history.append(sync_status)
            
            logger.info(f"Sync completed for device: {device_id}")
            return True
            
        except Exception as e:
            logger.error(f"Sync failed for device {device_id}: {e}")
            
            # エラー時の同期ステータス更新
            sync_status = SyncStatus(
                device_id=device_id,
                last_sync=datetime.datetime.now(),
                sync_count=0,
                error_count=1,
                status="error"
            )
            
            self.sync_history.append(sync_status)
            return False
    
    def sync_from_github(self, device_id: str) -> bool:
        """GitHubからの同期"""
        try:
            if device_id not in self.devices:
                raise ValueError(f"Unknown device: {device_id}")
            
            # 他デバイスの知識を取得（実際の実装ではGitHub APIを使用）
            other_devices = [d for d in self.devices.keys() if d != device_id]
            
            for other_device in other_devices:
                # 他デバイスの知識を学習
                other_knowledge = [
                    k for k in self.knowledge_base 
                    if k.device_id == other_device and k.status == "active"
                ]
                
                # 知識の統合・学習処理
                for knowledge in other_knowledge:
                    # 重複チェック
                    if not any(k.id == knowledge.id for k in self.knowledge_base):
                        # 新しい知識として追加
                        new_knowledge = KnowledgeItem(
                            id=knowledge.id,
                            title=knowledge.title,
                            content=knowledge.content,
                            category=knowledge.category,
                            device_id=device_id,  # 学習したデバイスに変更
                            created_at=knowledge.created_at,
                            updated_at=datetime.datetime.now(),
                            tags=knowledge.tags + ["learned"],
                            priority=knowledge.priority,
                            status="active"
                        )
                        self.knowledge_base.append(new_knowledge)
            
            logger.info(f"Sync from GitHub completed for device: {device_id}")
            return True
            
        except Exception as e:
            logger.error(f"Sync from GitHub failed for device {device_id}: {e}")
            return False
    
    def get_integrated_knowledge(self) -> List[KnowledgeItem]:
        """統合された知識の取得"""
        # 全デバイスの知識を統合
        integrated = []
        knowledge_ids = set()
        
        for knowledge in self.knowledge_base:
            if knowledge.id not in knowledge_ids and knowledge.status == "active":
                integrated.append(knowledge)
                knowledge_ids.add(knowledge.id)
        
        # 優先度と更新日時でソート
        integrated.sort(key=lambda x: (-x.priority, -x.updated_at.timestamp()))
        
        return integrated
    
    def get_device_status(self, device_id: str) -> Optional[Dict[str, Any]]:
        """デバイスのステータス取得"""
        if device_id not in self.devices:
            return None
        
        device = self.devices[device_id]
        
        # 最新の同期ステータスを取得
        latest_sync = None
        for sync in reversed(self.sync_history):
            if sync.device_id == device_id:
                latest_sync = sync
                break
        
        # デバイス固有の知識数を取得
        device_knowledge_count = len([
            k for k in self.knowledge_base 
            if k.device_id == device_id and k.status == "active"
        ])
        
        return {
            "device_info": asdict(device),
            "latest_sync": asdict(latest_sync) if latest_sync else None,
            "knowledge_count": device_knowledge_count,
            "total_knowledge": len(self.knowledge_base),
            "status": "active" if latest_sync and latest_sync.status == "success" else "inactive"
        }
    
    def generate_sync_report(self) -> str:
        """同期レポートの生成"""
        report = []
        report.append("# マルチデバイス同期レポート")
        report.append(f"生成日時: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("")
        
        # デバイス別ステータス
        report.append("## デバイス別ステータス")
        for device_id, device in self.devices.items():
            status = self.get_device_status(device_id)
            if status:
                report.append(f"### {device.device_name}")
                report.append(f"- プラットフォーム: {device.platform}")
                report.append(f"- アカウント: {device.account}")
                report.append(f"- 役割: {device.role}")
                report.append(f"- 知識数: {status['knowledge_count']}")
                report.append(f"- ステータス: {status['status']}")
                if status['latest_sync']:
                    report.append(f"- 最終同期: {status['latest_sync']['last_sync']}")
                report.append("")
        
        # 統合知識サマリー
        integrated_knowledge = self.get_integrated_knowledge()
        report.append("## 統合知識サマリー")
        report.append(f"- 総知識数: {len(integrated_knowledge)}")
        
        # カテゴリ別集計
        categories = {}
        for knowledge in integrated_knowledge:
            categories[knowledge.category] = categories.get(knowledge.category, 0) + 1
        
        report.append("- カテゴリ別:")
        for category, count in categories.items():
            report.append(f"  - {category}: {count}")
        
        report.append("")
        
        # 同期履歴
        report.append("## 同期履歴")
        for sync in self.sync_history[-10:]:  # 最新10件
            report.append(f"- {sync.device_id}: {sync.last_sync} - {sync.status}")
        
        return "\n".join(report)

def main():
    """メイン関数 - デモ実行"""
    print("🔄 マルチデバイス・マルチアカウント同期システム")
    print("=" * 50)
    
    # 同期システムの初期化
    sync_system = MultiDeviceSync()
    
    # デバイスの登録
    main_pc = DeviceInfo(
        device_id="main-pc",
        device_name="Main PC (Windows)",
        platform="Windows",
        account="0nyx-lab",
        role="main",
        last_sync=datetime.datetime.now(),
        status="active"
    )
    
    sub_pc = DeviceInfo(
        device_id="sub-pc",
        device_name="Sub PC (Mac)",
        platform="macOS",
        account="sub-account",
        role="sub",
        last_sync=datetime.datetime.now(),
        status="active"
    )
    
    sync_system.register_device("main-pc", main_pc)
    sync_system.register_device("sub-pc", sub_pc)
    
    # サンプル知識の追加
    knowledge1 = KnowledgeItem(
        id="rule-001",
        title="仮想環境の必須使用",
        content="Python開発では必ず仮想環境を使用する",
        category="rule",
        device_id="main-pc",
        created_at=datetime.datetime.now(),
        updated_at=datetime.datetime.now(),
        tags=["python", "environment"],
        priority=5,
        status="active"
    )
    
    knowledge2 = KnowledgeItem(
        id="issue-001",
        title="PDCAサイクルの高速回転",
        content="Issue管理によるPDCAサイクルの高速実行",
        category="issue",
        device_id="sub-pc",
        created_at=datetime.datetime.now(),
        updated_at=datetime.datetime.now(),
        tags=["pdca", "github", "issue"],
        priority=4,
        status="active"
    )
    
    sync_system.add_knowledge(knowledge1)
    sync_system.add_knowledge(knowledge2)
    
    # 同期の実行
    print("📤 GitHubへの同期実行...")
    sync_system.sync_to_github("main-pc")
    sync_system.sync_to_github("sub-pc")
    
    print("📥 GitHubからの同期実行...")
    sync_system.sync_from_github("main-pc")
    sync_system.sync_from_github("sub-pc")
    
    # レポートの生成・表示
    print("\n📊 同期レポート生成...")
    report = sync_system.generate_sync_report()
    print(report)
    
    # 統合知識の表示
    print("\n🧠 統合知識:")
    integrated_knowledge = sync_system.get_integrated_knowledge()
    for knowledge in integrated_knowledge:
        print(f"- {knowledge.title} ({knowledge.category}) - {knowledge.device_id}")
    
    print("\n✅ マルチデバイス同期システムのデモ完了")

if __name__ == "__main__":
    main()
