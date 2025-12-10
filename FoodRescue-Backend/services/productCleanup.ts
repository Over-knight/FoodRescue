import cron from "node-cron";
import { Product} from "../models/product";

export const startProductCleanupJob = () => {
    cron.schedule("0 0 * * *", async () => {
        try {
            const oneDayFromNow = new Date();
            oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

            const result = await Product.deleteMany({
                expiryDate: { $lte: oneDayFromNow}
            });

            console.log(`[Product Cleanup] Deleted ${result.deletedCount} expired products`);
        } catch (error) {
            console.error("Product cleanup job failed: ", error)
        }
    });
    console.log('Product cleanup job scheduled');
}
