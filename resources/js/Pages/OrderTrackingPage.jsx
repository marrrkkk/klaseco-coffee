import { Head } from "@inertiajs/react";
import OrderTrackingInterface from "@/Components/Customer/OrderTrackingInterface";
import MinimalistLayout from "@/Layouts/MinimalistLayout";

export default function OrderTrackingPage() {
    return (
        <MinimalistLayout title="Track Order - KlaséCo">
            <Head title="Track Order - KlaséCo" />
            <OrderTrackingInterface />
        </MinimalistLayout>
    );
}
