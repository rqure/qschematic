import json
import cv2
import numpy as np

SCALE_FACTOR = 1 / 3  # Scale factor for resizing the image
SCALE = lambda x: x * SCALE_FACTOR

def extract_floor_data(image_path):
    # Step 1: Load and preprocess the image
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if image is None:
        raise FileNotFoundError(f"Image not found at path: {image_path}")
    image = cv2.flip(image, 0)  # Flip the image vertically
    _, binary_image = cv2.threshold(image, 200, 255, cv2.THRESH_BINARY_INV)

    # Step 2: Connected Component Labeling
    num_labels, labels = cv2.connectedComponents(binary_image)

    # Step 3: Find contours for each component
    contours, _ = cv2.findContours(binary_image, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    plan_data = {"shapes": []}

    # Step 4: Process each contour and generate SDK-compatible shape data
    for i, contour in enumerate(contours):
        # Calculate the bounding box for the component
        x, y, w, h = cv2.boundingRect(contour)
        
        # Extract edges (coordinates of contour points)
        edges = [{"x": int(pt[0][0]), "y": int(pt[0][1])} for pt in contour]

        # Optionally, approximate the contour to reduce the number of points
        epsilon = 0.01 * cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, epsilon, True)
        edges = [{"x": int(pt[0][0]), "y": int(pt[0][1])} for pt in approx]

        edges = [{"x": SCALE(e["x"]), "y": SCALE(e["y"])} for e in edges]

        shape_type = "Polygon"  # Other types are Polyline and Circle

        # Create the shape data structure for the SDK
        shape_data = {
            "type": shape_type,
            "edges": edges
        }

        # Add the shape to the plan data
        plan_data["shapes"].append(shape_data)

    return plan_data

def extract_wall_data(image_path):
    # Step 1: Load and preprocess the image
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if image is None:
        raise FileNotFoundError(f"Image not found at path: {image_path}")
    image = cv2.flip(image, 0)  # Flip the image vertically
    
    # Step 2: Edge detection to find walls
    # Adjust Canny thresholds to capture more details
    edges = cv2.Canny(image, 200, 200, apertureSize=3)
    
    # # Step 3: Use morphological operations to enhance wall lines
    # kernel = np.ones((3,3), np.uint8)
    # edges = cv2.dilate(edges, kernel, iterations=1)
    # edges = cv2.erode(edges, kernel, iterations=1)
    
    # Step 4: Find all contours, including internal walls
    contours, hierarchy = cv2.findContours(edges, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)  # No approximation
    
    wall_data = {"shapes": []}
    
    # Step 5: Process each contour and generate SDK-compatible shape data
    for idx, contour in enumerate(contours):
        # Filter out small contours that may not represent walls
        # if cv2.contourArea(contour) < 15:
        #     continue
        
        # Optional: Use hierarchy to filter contours if needed
        # For example, ignore child contours or specific hierarchy levels
        # hierarchy[0][idx] provides information about the current contour

        # Extract edges (coordinates of contour points)
        edges_list = [{"x": SCALE(int(pt[0][0])), "y": SCALE(int(pt[0][1]))} for pt in contour]
        
        # if len(edges_list) < 2:
            # continue  # Not enough points to form a wall
        
        shape_type = "Polyline"  # Walls are typically polylines

        # Create the shape data structure for the SDK
        shape_data = {
            "type": shape_type,
            "edges": edges_list
        }
        
        # Add the shape to the wall data
        wall_data["shapes"].append(shape_data)
    
    return wall_data

def save_floor_plan_json(floor_data, wall_data, output_path):
    combined_data = {
        "model": {
            "location": {"x": 0, "y": 0},
            "rotation": 90,
            "shapes": floor_data["shapes"] + wall_data["shapes"]
        }
    }
    
    with open(output_path, "w") as json_file:
        json.dump(combined_data, json_file, indent=4)
    
    print(f"Floor plan JSON data has been saved to '{output_path}'.")

# Example Usage
if __name__ == "__main__":
    floor_data = extract_floor_data("floor_plan.png")
    wall_data = extract_wall_data("floor_plan.png")
    save_floor_plan_json(floor_data, wall_data, "floor_plan.json")
