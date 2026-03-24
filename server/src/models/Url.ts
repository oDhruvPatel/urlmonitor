import mongoose, { Schema, Document } from "mongoose";

interface IMonitor extends Document {
    url: string;
    name: string;
    user: mongoose.Types.ObjectId;
    status: "active" | "paused";
    isActive: boolean;
    intervalMinutes: number;
    lastChecked: Date;
    createdAt: Date;
    updatedAt: Date;
}

const MonitorSchema = new Schema<IMonitor>(
    {
        url: {
            type: String,
            required: true,
            trim: true,
        },
        name: {
            type: String,
            default: "",
            trim: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",          // links to your User model
            required: true,
        },
        status: {
            type: String,
            enum: ["active", "paused"],
            default: "active",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        intervalMinutes: {
            type: Number,
            default: 5,
            enum: [1, 5, 10, 30, 60], // only allow these intervals
        },
        lastChecked: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true, // auto adds createdAt + updatedAt
    }
);

// auto-delete documents older than 30 days
MonitorSchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: 30 * 24 * 60 * 60 }
);

export default mongoose.model<IMonitor>("Monitor", MonitorSchema);