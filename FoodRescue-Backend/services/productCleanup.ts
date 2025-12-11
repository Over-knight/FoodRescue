import cron from "node-cron";
import { Product} from "../models/product";

export const startProductCleanupJob = () => {
    cron.schedule("0 0 * * *", async () => {
        try {
            // Set to midnight (00:00:00) of the next day
            // This deletes any product that expired before the start of tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            const result = await Product.deleteMany({
                expiryDate: { $lt: tomorrow }
            });

            console.log(`[Product Cleanup] Deleted ${result.deletedCount} expired products`);
        } catch (error) {
            console.error("Product cleanup job failed: ", error)
        }
    });
    console.log('Product cleanup job scheduled to run daily at midnight');
}
