from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

class DriveOperations:
    def __init__(self, credentials):
        """Initialize the Drive API service.
        
        Args:
            credentials: The credentials object from drive_login.get_credentials()
        """
        self.service = build("drive", "v3", credentials=credentials)

    def list_files(self, page_size=200):
        """Lists files in the user's Google Drive.
        
        Args:
            page_size: Number of files to list (default: 200)
            
        Returns:
            List of dictionaries containing file information
        """
        try:
            results = (
                self.service.files()
                .list(pageSize=page_size, fields="nextPageToken, files(id, name)")
                .execute()
            )
            items = results.get("files", [])

            if not items:
                print("No files found.")
                return []
                
            return items

        except HttpError as error:
            print(f"An error occurred: {error}")
            return []

    def print_files(self, files):
        """Prints the list of files in a formatted way.
        
        Args:
            files: List of file dictionaries from list_files()
        """
        print("Files:")
        for item in files:
            print(f"{item['name']} ({item['id']})") 