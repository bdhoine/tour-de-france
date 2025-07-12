// Main application entry point
import { DataManager } from './data.js';
import { UIManager } from './ui.js';

class TourDeFrameApp {
    constructor() {
        this.dataManager = new DataManager();
        this.uiManager = null;
    }

    async initialize() {
        try {
            // Load data first
            await this.dataManager.loadData();
            
            // Initialize UI after data is loaded
            this.uiManager = new UIManager(this.dataManager);
            
            // Handle initial URL fragment or show default view
            this.uiManager.handleHashChange();
            
            console.log('Application initialized successfully');
            console.log(`Loaded ${this.dataManager.getTotalCount()} participants`);
            
        } catch (error) {
            console.error('Failed to initialize application:', error);
            
            // Show error in UI if possible
            if (this.uiManager) {
                this.uiManager.showError('Failed to load data. Please try refreshing the page.');
            } else {
                // Fallback error display
                const tableBody = document.getElementById('tableBody');
                if (tableBody) {
                    tableBody.innerHTML = '<tr><td colspan="3">Failed to load data. Please check console for details.</td></tr>';
                }
            }
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new TourDeFrameApp();
    app.initialize();
});

// Export for potential testing or external access
window.TourDeFrameApp = TourDeFrameApp;