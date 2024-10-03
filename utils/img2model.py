import json
import cv2
import argparse

SCALE_FACTOR = 1 / 3  # Scale factor for resizing the image
SCALE = lambda x: x * SCALE_FACTOR

def extract_floor_data(image_path):
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if image is None:
        raise FileNotFoundError(f"Image not found at path: {image_path}")
    image = cv2.flip(image, 0)  # Flip the image vertically
    _, binary_image = cv2.threshold(image, 200, 255, cv2.THRESH_BINARY_INV)
    contours, _ = cv2.findContours(binary_image, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    plan_data = {"shapes": []}

    for contour in contours:        
        edges = [{"x": int(pt[0][0]), "y": int(pt[0][1])} for pt in contour]

        epsilon = 0.01 * cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, epsilon, True)
        edges = [{"x": int(pt[0][0]), "y": int(pt[0][1])} for pt in approx]

        edges = [{"x": SCALE(e["x"]), "y": SCALE(e["y"])} for e in edges]

        shape_type = "Polygon"

        shape_data = {
            "type": shape_type,
            "edges": edges
        }

        plan_data["shapes"].append(shape_data)

    return plan_data

def extract_wall_data(image_path):
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if image is None:
        raise FileNotFoundError(f"Image not found at path: {image_path}")
    image = cv2.flip(image, 0)  # Flip the image vertically
    
    edges = cv2.Canny(image, 200, 200, apertureSize=3)

    contours, _ = cv2.findContours(edges, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)  # No approximation
    
    wall_data = {"shapes": []}
    
    for contour in contours:
        edges_list = [{"x": SCALE(int(pt[0][0])), "y": SCALE(int(pt[0][1]))} for pt in contour]
        
        shape_type = "Polyline"
        shape_data = {
            "type": shape_type,
            "edges": edges_list
        }
        
        wall_data["shapes"].append(shape_data)
    
    return wall_data

def save_floor_plan_json(floor_data, wall_data, output_path):
    combined_data = {
        "model": {
            "location": {"x": 0, "y": 0},
            "rotation": 0,
            "shapes": floor_data["shapes"] + wall_data["shapes"]
        }
    }
    
    with open(output_path, "w") as json_file:
        json.dump(combined_data, json_file, indent=4)
    
    print(f"Floor plan JSON data has been saved to '{output_path}'.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract floor and wall data from a floor plan image")
    parser.add_argument("image_path", type=str, help="Path to the floor plan image")
    parser.add_argument("output_path", type=str, help="Path to save the output JSON")
    args = parser.parse_args()

    floor_data = extract_floor_data(args.image_path)
    wall_data = extract_wall_data(args.image_path)
    save_floor_plan_json(floor_data, wall_data, args.output_path)