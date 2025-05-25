/**
 * Simplified model representation for use in UI components and benchmark services
 */
export interface DisplayModel {
  /**
   * The unique identifier of the model, typically in the format "provider/model-name"
   */
  id: string;
  
  /**
   * The human-readable name for display in UI components
   */
  label: string;
  
  /**
   * Indicates whether the model is currently available for use
   */
  isAvailable?: boolean;
}
