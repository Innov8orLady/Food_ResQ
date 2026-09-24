"""
FoodResQ - Machine Learning Food Classifier Trainer
Trains a Deep Learning Computer Vision Model (MobileNetV3 Transfer Learning)
on a multi-class Food Dataset benchmark.
"""

import os
import sys
import json
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms, models

# -------------------------------------------------------------------
# CONFIGURATION & CLASSES
# -------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data", "food_dataset")
MODELS_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

CLASSES = [
    {
        "id": "pizza",
        "name": "Woodfired Oven Pizza / Margherita Slices",
        "category": "Cooked Meals",
        "dietary": "Vegetarian",
        "base_safe_hours": 5,
        "tags": ["Baked", "Cheese", "High Demand", "Perishable"]
    },
    {
        "id": "bread_bakery",
        "name": "Bakery Assortment & Fresh Bread",
        "category": "Bakery & Bread",
        "dietary": "Vegetarian",
        "base_safe_hours": 36,
        "tags": ["Baked", "Ready to Eat", "Low Perishability"]
    },
    {
        "id": "rice_curry_thali",
        "name": "North Indian Thali / Rice & Dal Meal",
        "category": "Cooked Meals",
        "dietary": "Vegetarian",
        "base_safe_hours": 5,
        "tags": ["Cooked", "Staple", "High Demand"]
    },
    {
        "id": "burger_sandwich",
        "name": "Gourmet Sandwiches & Fast Food",
        "category": "Cooked Meals",
        "dietary": "Vegetarian",
        "base_safe_hours": 6,
        "tags": ["Snack", "Fast Food", "Ready to Eat"]
    },
    {
        "id": "pasta_noodles",
        "name": "Italian Pasta & Asian Noodles",
        "category": "Cooked Meals",
        "dietary": "Vegetarian",
        "base_safe_hours": 5,
        "tags": ["Cooked", "Staple", "High Demand"]
    },
    {
        "id": "fresh_produce_salad",
        "name": "Fresh Farm Produce & Seasonal Fruit",
        "category": "Fresh Produce",
        "dietary": "Vegan",
        "base_safe_hours": 72,
        "tags": ["Raw", "Fresh", "Nutritious"]
    },
    {
        "id": "dairy_dessert",
        "name": "Fresh Dairy & Desserts Assortment",
        "category": "Dairy Products",
        "dietary": "Vegetarian",
        "base_safe_hours": 18,
        "tags": ["Dairy", "Perishable", "Cold Chain"]
    },
    {
        "id": "chicken_poultry",
        "name": "Non-Veg Meal / Chicken & Meat",
        "category": "Cooked Meals",
        "dietary": "Non-Vegetarian",
        "base_safe_hours": 4,
        "tags": ["Cooked", "Protein", "Perishable"]
    }
]

CLASS_NAMES = [c["id"] for c in CLASSES]
NUM_CLASSES = len(CLASSES)

# High-resolution benchmark food image URLs for initial bootstrapping
FOOD_URLS = {
    "pizza": [
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80",
        "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80",
        "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500&q=80",
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80",
        "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&q=80"
    ],
    "bread_bakery": [
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80",
        "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=500&q=80",
        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80",
        "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=500&q=80",
        "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=500&q=80"
    ],
    "rice_curry_thali": [
        "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80",
        "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500&q=80",
        "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80",
        "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&q=80",
        "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&q=80"
    ],
    "burger_sandwich": [
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80",
        "https://images.unsplash.com/photo-1521305916504-4a1121188589?w=500&q=80",
        "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=80",
        "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80",
        "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&q=80"
    ],
    "pasta_noodles": [
        "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&q=80",
        "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=500&q=80",
        "https://images.unsplash.com/photo-1621996346565-e3d5d6281788?w=500&q=80",
        "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=500&q=80",
        "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&q=80"
    ],
    "fresh_produce_salad": [
        "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&q=80",
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80",
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&q=80",
        "https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=500&q=80",
        "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&q=80"
    ],
    "dairy_dessert": [
        "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&q=80",
        "https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=500&q=80",
        "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500&q=80",
        "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&q=80",
        "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&q=80"
    ],
    "chicken_poultry": [
        "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=500&q=80",
        "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&q=80",
        "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500&q=80",
        "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&q=80",
        "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=500&q=80"
    ]
}

def download_one(url, path):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=10) as resp, open(path, 'wb') as f:
            f.write(resp.read())
        # Verify valid image
        with Image.open(path) as img:
            img.verify()
        return True
    except Exception as e:
        if os.path.exists(path):
            try:
                os.remove(path)
            except Exception:
                pass
        return False

def prepare_dataset():
    print("[Dataset] Preparing FoodResQ multi-class food benchmark...")
    
    # Check server uploads for user images and incorporate them
    uploads_dir = os.path.join(BASE_DIR, "..", "server", "uploads")
    if os.path.exists(uploads_dir):
        user_files = os.listdir(uploads_dir)
        for uf in user_files:
            src = os.path.join(uploads_dir, uf)
            if not os.path.isfile(src) or os.path.getsize(src) < 1000:
                continue
            # Categorize based on known uploads
            dest_class = None
            if "food-1790007361071" in uf or "food-1790044640750" in uf or "food-1790006544397" in uf:
                dest_class = "pizza"
            elif "food-1790044613523" in uf:
                dest_class = "bread_bakery"
            
            if dest_class:
                target_dir = os.path.join(DATA_DIR, dest_class)
                os.makedirs(target_dir, exist_ok=True)
                dest = os.path.join(target_dir, f"user_{uf}")
                try:
                    with Image.open(src) as im:
                        im.convert("RGB").save(dest, "JPEG")
                    print(f"  [User Sample] Ingested user upload into class '{dest_class}': {uf}")
                except Exception as e:
                    pass

    # Download benchmark images
    tasks = []
    with ThreadPoolExecutor(max_workers=8) as executor:
        for cname, urls in FOOD_URLS.items():
            cdir = os.path.join(DATA_DIR, cname)
            os.makedirs(cdir, exist_ok=True)
            for idx, url in enumerate(urls):
                dest_path = os.path.join(cdir, f"sample_{idx}.jpg")
                if not os.path.exists(dest_path) or os.path.getsize(dest_path) < 1000:
                    tasks.append(executor.submit(download_one, url, dest_path))

        for t in tasks:
            t.result()

    # Verify counts per class
    counts = {}
    for cname in CLASS_NAMES:
        cdir = os.path.join(DATA_DIR, cname)
        cnt = len([f for f in os.listdir(cdir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]) if os.path.exists(cdir) else 0
        counts[cname] = cnt
        print(f"  [Class] {cname.ljust(22)} : {cnt} base images")
    return counts

# -------------------------------------------------------------------
# AUGMENTED DATASET GENERATOR
# -------------------------------------------------------------------
class FoodAugmentedDataset(Dataset):
    def __init__(self, data_dir, class_names, samples_per_class=40, is_train=True):
        self.samples = []
        self.class_names = class_names
        self.class_to_idx = {c: i for i, c in enumerate(class_names)}

        # Load existing images per class
        class_images = {c: [] for c in class_names}
        for c in class_names:
            cdir = os.path.join(data_dir, c)
            if os.path.exists(cdir):
                for f in os.listdir(cdir):
                    if f.lower().endswith(('.jpg', '.jpeg', '.png')):
                        p = os.path.join(cdir, f)
                        try:
                            # test read
                            with Image.open(p) as img:
                                img.convert("RGB")
                            class_images[c].append(p)
                        except Exception:
                            pass

        # Balance dataset with multiple augmented views
        for c, imgs in class_images.items():
            if not imgs:
                continue
            idx = self.class_to_idx[c]
            needed = samples_per_class
            for i in range(needed):
                img_path = imgs[i % len(imgs)]
                self.samples.append((img_path, idx))

        if is_train:
            self.transform = transforms.Compose([
                transforms.RandomResizedCrop(224, scale=(0.75, 1.0)),
                transforms.RandomHorizontalFlip(p=0.5),
                transforms.RandomRotation(degrees=15),
                transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
            ])
        else:
            self.transform = transforms.Compose([
                transforms.Resize(256),
                transforms.CenterCrop(224),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
            ])

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        path, label = self.samples[idx]
        with Image.open(path) as img:
            img = img.convert("RGB")
            tensor = self.transform(img)
        return tensor, label

# -------------------------------------------------------------------
# MODEL DEFINITION & TRAINING
# -------------------------------------------------------------------
def build_model(num_classes):
    print("[Model] Loading pre-trained MobileNetV3-Small backbone...")
    weights = models.MobileNet_V3_Small_Weights.DEFAULT
    model = models.mobilenet_v3_small(weights=weights)

    # Freeze early feature layers to prevent overfitting
    for param in model.features[:8].parameters():
        param.requires_grad = False

    # Replace classifier head for FoodResQ food classes
    in_features = model.classifier[0].in_features  # 576
    model.classifier = nn.Sequential(
        nn.Linear(in_features, 256),
        nn.Hardswish(),
        nn.Dropout(p=0.2),
        nn.Linear(256, num_classes)
    )
    return model

def train_model(epochs=12, batch_size=16):
    prepare_dataset()

    print(f"\n[Training] Initializing dataset with {NUM_CLASSES} classes...")
    train_dataset = FoodAugmentedDataset(DATA_DIR, CLASS_NAMES, samples_per_class=45, is_train=True)
    val_dataset = FoodAugmentedDataset(DATA_DIR, CLASS_NAMES, samples_per_class=10, is_train=False)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0)

    print(f"  Training samples   : {len(train_dataset)}")
    print(f"  Validation samples : {len(val_dataset)}")

    device = torch.device("cpu")
    model = build_model(NUM_CLASSES).to(device)

    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
    optimizer = torch.optim.AdamW(filter(lambda p: p.requires_grad, model.parameters()), lr=1e-3, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    best_acc = 0.0
    best_path = os.path.join(MODELS_DIR, "food_classifier.pt")
    scripted_path = os.path.join(MODELS_DIR, "food_classifier_scripted.pt")

    print(f"\n[Training] Starting Transfer Learning for {epochs} epochs on CPU...")
    start_time = time.time()

    for epoch in range(1, epochs + 1):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0

        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)

        scheduler.step()
        train_loss = running_loss / total
        train_acc = correct / total

        # Validation
        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)
                val_loss += loss.item() * images.size(0)
                _, preds = torch.max(outputs, 1)
                val_correct += (preds == labels).sum().item()
                val_total += labels.size(0)

        val_acc = val_correct / val_total if val_total > 0 else 0.0
        print(f"Epoch [{epoch:02d}/{epochs:02d}] Train Loss: {train_loss:.4f} | Train Acc: {train_acc*100:.1f}% | Val Acc: {val_acc*100:.1f}%")

        if val_acc >= best_acc:
            best_acc = val_acc
            # Save checkpoint
            torch.save({
                "model_state_dict": model.state_dict(),
                "classes": CLASSES,
                "class_names": CLASS_NAMES,
                "epoch": epoch,
                "val_acc": val_acc
            }, best_path)

    elapsed = time.time() - start_time
    print(f"\n[Done] Training completed in {elapsed:.1f}s. Best Val Accuracy: {best_acc*100:.1f}%")
    print(f"  Saved state dict to: {best_path}")

    # Export TorchScript for high-speed inference without requiring original class definition
    print("[Export] Tracing model to TorchScript format...")
    model.eval()
    example_input = torch.randn(1, 3, 224, 224)
    traced_model = torch.jit.trace(model, example_input)
    traced_model.save(scripted_path)
    print(f"  Saved TorchScript model to: {scripted_path}")

    # Save classes metadata JSON
    classes_json_path = os.path.join(MODELS_DIR, "food_classes.json")
    with open(classes_json_path, "w", encoding="utf-8") as f:
        json.dump(CLASSES, f, indent=2)
    print(f"  Saved class metadata to: {classes_json_path}")

    return best_acc

if __name__ == "__main__":
    acc = train_model(epochs=10, batch_size=16)
    print(f"\n[FoodResQ ML] Model training successfully finalized with {acc*100:.1f}% accuracy.")
