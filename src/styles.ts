// Import all required styles
import './platform/web/ui/css/themes/element/theme-element-light.css';
import './platform/web/ui/session/room/lightbox-styles.css';
import './platform/web/ui/session/room/timeline/image-styles.css';

// Export a dummy function to ensure the file is not tree-shaken
export function ensureStyles() {
    // This function is just to ensure the CSS imports are not removed
    return true;
}