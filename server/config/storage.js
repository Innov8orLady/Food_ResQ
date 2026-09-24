import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BUNDLED_DATA_FILE = path.join(__dirname, "../data/store.json");
const DATA_FILE = process.env.VERCEL
  ? path.join("/tmp", "foodresq_store.json")
  : BUNDLED_DATA_FILE;

// In-memory data tables
let store = {
  users: [],
  listings: [],
  claims: [],
  pickups: [],
  notifications: [],
  forecasts: []
};

// Load existing store from JSON if present
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    store = { ...store, ...JSON.parse(raw) };
  } else if (fs.existsSync(BUNDLED_DATA_FILE)) {
    const raw = fs.readFileSync(BUNDLED_DATA_FILE, "utf-8");
    store = { ...store, ...JSON.parse(raw) };
  }
} catch (e) {
  console.warn("[Storage] Initializing fresh local store:", e.message);
}

const persistStore = () => {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Storage] Fallback memory store warning:", err.message);
  }
};

export class Collection {
  constructor(name) {
    this.name = name;
    if (!store[name]) store[name] = [];
  }

  get items() {
    return store[this.name];
  }

  async find(filter = {}) {
    let result = this.items.filter(item => {
      for (const [key, val] of Object.entries(filter)) {
        if (val && typeof val === "object" && "$ne" in val) {
          if (item[key] === val.$ne) return false;
        } else if (val && typeof val === "object" && "$in" in val) {
          if (!val.$in.includes(item[key])) return false;
        } else if (val !== undefined && item[key] !== val) {
          return false;
        }
      }
      return true;
    });
    return JSON.parse(JSON.stringify(result));
  }

  async findOne(filter = {}) {
    const items = await this.find(filter);
    return items.length > 0 ? items[0] : null;
  }

  async findById(id) {
    const item = this.items.find(i => String(i._id || i.id) === String(id));
    return item ? JSON.parse(JSON.stringify(item)) : null;
  }

  async create(data) {
    const newItem = {
      _id: crypto.randomBytes(12).toString("hex"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    this.items.push(newItem);
    persistStore();
    return JSON.parse(JSON.stringify(newItem));
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const index = this.items.findIndex(i => String(i._id || i.id) === String(id));
    if (index === -1) return null;
    const current = this.items[index];
    const updated = {
      ...current,
      ...(update.$set || update),
      updatedAt: new Date().toISOString()
    };
    this.items[index] = updated;
    persistStore();
    return JSON.parse(JSON.stringify(updated));
  }

  async findByIdAndDelete(id) {
    const index = this.items.findIndex(i => String(i._id || i.id) === String(id));
    if (index === -1) return null;
    const removed = this.items.splice(index, 1)[0];
    persistStore();
    return JSON.parse(JSON.stringify(removed));
  }

  async countDocuments(filter = {}) {
    const items = await this.find(filter);
    return items.length;
  }

  async deleteMany(filter = {}) {
    if (Object.keys(filter).length === 0) {
      store[this.name] = [];
    } else {
      store[this.name] = this.items.filter(item => {
        for (const [key, val] of Object.entries(filter)) {
          if (item[key] === val) return false;
        }
        return true;
      });
    }
    persistStore();
    return { deletedCount: 0 };
  }
}

export const collections = {
  users: new Collection("users"),
  listings: new Collection("listings"),
  claims: new Collection("claims"),
  pickups: new Collection("pickups"),
  notifications: new Collection("notifications"),
  forecasts: new Collection("forecasts")
};
