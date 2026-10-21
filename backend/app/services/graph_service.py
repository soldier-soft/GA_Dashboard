import os
import requests
from datetime import datetime
from typing import Optional, Dict, Any

class MicrosoftGraphService:
    def __init__(self):
        self.tenant_id = os.getenv("MICROSOFT_TENANT_ID")
        self.client_id = os.getenv("MICROSOFT_CLIENT_ID")
        self.client_secret = os.getenv("MICROSOFT_CLIENT_SECRET")
        self.drive_id = os.getenv("ONEDRIVE_DRIVE_ID")
        self.item_id = os.getenv("ONEDRIVE_ITEM_ID")
        self.access_token: Optional[str] = None
        self.token_expiry: Optional[datetime] = None
        self.last_sync_time: Optional[datetime] = None
        self.last_remote_etag: Optional[str] = None
        self.public_onedrive_url = "https://1drv.ms/x/c/6e343e4ed189eaf3/IQD8Y2ntB6CWSJyhBbRFmJaMAYGy5YwQiXxAgPiyZJOJqSE?e=NTegEw"

    def is_configured(self) -> bool:
        return bool(self.tenant_id and self.client_id and self.client_secret)

    def get_auth_token(self) -> Optional[str]:
        if not self.is_configured():
            return None
        
        token_url = f"https://login.microsoftonline.com/{self.tenant_id}/oauth2/v2.0/token"
        payload = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "scope": "https://graph.microsoft.com/.default",
            "grant_type": "client_credentials"
        }
        try:
            resp = requests.post(token_url, data=payload, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                self.access_token = data.get("access_token")
                return self.access_token
        except Exception as e:
            print(f"Error fetching Graph token: {e}")
        return None

    def check_for_updates(self, target_save_path: str) -> Dict[str, Any]:
        """
        Polls Microsoft Graph API for updates. If new version exists, downloads it to target_save_path.
        If credentials not configured, returns clear status indicating local Excel mode is active.
        """
        if not self.is_configured():
            return {
                "connected": False,
                "mode": "local_excel",
                "message": (
                    "Microsoft Graph API credentials not configured in environment. "
                    "Operating with local authoritative Excel workbook. "
                    "Configure MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, MICROSOFT_TENANT_ID to enable live cloud sync."
                ),
                "last_checked": datetime.now().isoformat(),
                "public_onedrive_url": self.public_onedrive_url
            }

        token = self.get_auth_token()
        if not token:
            return {
                "connected": False,
                "mode": "graph_error",
                "message": "Failed to authenticate with Microsoft Graph API using configured tenant/client credentials.",
                "last_checked": datetime.now().isoformat()
            }

        headers = {"Authorization": f"Bearer {token}"}
        endpoint = f"https://graph.microsoft.com/v1.0/drives/{self.drive_id}/items/{self.item_id}"
        
        try:
            resp = requests.get(endpoint, headers=headers, timeout=10)
            if resp.status_code != 200:
                return {
                    "connected": False,
                    "mode": "graph_error",
                    "message": f"Graph API item check failed: HTTP {resp.status_code} {resp.text}",
                    "last_checked": datetime.now().isoformat()
                }

            meta = resp.json()
            etag = meta.get("eTag")
            last_mod = meta.get("lastModifiedDateTime")

            if etag != self.last_remote_etag:
                download_url = meta.get("@microsoft.graph.downloadUrl")
                if download_url:
                    dl_resp = requests.get(download_url, timeout=30)
                    if dl_resp.status_code == 200:
                        with open(target_save_path, "wb") as f:
                            f.write(dl_resp.content)
                        self.last_remote_etag = etag
                        self.last_sync_time = datetime.now()
                        return {
                            "connected": True,
                            "mode": "graph_synced",
                            "updated": True,
                            "etag": etag,
                            "last_modified": last_mod,
                            "message": "Successfully synchronized latest workbook from OneDrive via Microsoft Graph API."
                        }

            return {
                "connected": True,
                "mode": "graph_synced",
                "updated": False,
                "etag": etag,
                "last_modified": last_mod,
                "message": "Workbook is up-to-date with OneDrive source."
            }

        except Exception as e:
            return {
                "connected": False,
                "mode": "graph_error",
                "message": f"Exception connecting to Microsoft Graph: {str(e)}",
                "last_checked": datetime.now().isoformat()
            }
