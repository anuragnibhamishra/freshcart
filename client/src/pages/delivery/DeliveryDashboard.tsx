import { useCallback, useEffect, useRef, useState } from "react";
import { PackageIcon, NavigationIcon } from "lucide-react";
import OtpModal from "../../components/Delivery/OtpModal";
import CancelModal from "../../components/Delivery/CancelModal";
import DeliveryOrderCard from "../../components/Delivery/DeliveryOrderCard";
import Loading from "../../components/Home/Loading";
import type { Order } from "../../types";
import axios from "axios";
import toast from "react-hot-toast";
const API_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000/api";

const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("delivery_token")}` }
});

const getRequestErrorMessage = (error: unknown, fallback: string) => {
    if (axios.isAxiosError<{ message?: string }>(error)) {
        return error.response?.data?.message || error.message || fallback;
    }
    return error instanceof Error ? error.message : fallback;
};


export default function DeliveryDashboard() {

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [tab, setTab] = useState<"active" | "completed">("active");
    const [tracking, setTracking] = useState(false);

    // OTP modal
    const [otpModal, setOtpModal] = useState<string | null>(null);
    const [otp, setOtp] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Cancel modal
    const [cancelModal, setCancelModal] = useState<string | null>(null);
    const [cancelReason, setCancelReason] = useState("");

    const watchIdRef = useRef<number | null>(null)

    const fetchOrders = useCallback(async () => {
        try {
            const { data } = await axios.get(
                `${API_URL}/delivery/my-deliveries?status=${tab}`,
                getAuthHeaders()
            );
            if (!Array.isArray(data.orders)) {
                throw new Error("The deliveries response was invalid");
            }
            setError(null);
            setOrders(data.orders);
        } catch (error: unknown) {
            const message = getRequestErrorMessage(error, "Failed to load deliveries");
            setOrders([]);
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, [tab]);

    useEffect(() => {
        let active = true;
        queueMicrotask(() => {
            if (active) void fetchOrders();
        });
        return () => {
            active = false;
        };
    }, [fetchOrders]);

    const refreshOrders = () => {
        setLoading(true);
        void fetchOrders();
    };

    // Share location only while tracking is enabled.
    useEffect(() => {
        const activeOrders = orders.filter((o) =>
            ["Assigned", "Packed", "Out for Delivery"].includes(o.status)
        );

        if (activeOrders.length === 0 || !tracking) {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current)
                watchIdRef.current = null;
            }
            return;
        }

        const sendLocation = (pos: GeolocationPosition) => {
            const { latitude: lat, longitude: lng } = pos.coords;

            activeOrders.forEach((order) => {
                axios.put(
                    `${API_URL}/delivery/my-deliveries/${order.id}/location`,
                    { lat, lng },
                    getAuthHeaders()
                ).then(() => {
                    setLocationError(null);
                }).catch((error: unknown) => {
                    setLocationError(getRequestErrorMessage(error, "Failed to share location"));
                });
            });
        }

        watchIdRef.current = navigator.geolocation.watchPosition(
            sendLocation,
            (error) => setLocationError(error.message || "Unable to read your location"), {
            enableHighAccuracy: true,
            maximumAge: 10000,
        }
        );

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
        };
    }, [orders, tracking]);

    const handleToggleTracking = () => {
        if (!tracking && !navigator.geolocation) {
            setLocationError("Location sharing is not supported by this browser");
            return;
        }
        setLocationError(null);
        setTracking((previous) => !previous);
    };

    const handleUpdateStatus = async (orderId: string, status: string) => {
        try {
            await axios.put(
                `${API_URL}/delivery/my-deliveries/${orderId}/status`,
                { status },
                getAuthHeaders()
            );
            toast.success(`Status updated to ${status}`);
            refreshOrders();
        } catch (error: unknown) {
            toast.error(getRequestErrorMessage(error, "Failed to update delivery status"));
        }
    };

    const handleComplete = async () => {
        if (!otpModal || !otp) return;
        setSubmitting(true);
        try {
            await axios.put(
                `${API_URL}/delivery/my-deliveries/${otpModal}/complete`,
                { otp },
                getAuthHeaders()
            );
            toast.success("Delivery completed!");
            setOtpModal(null);
            setOtp("");
            refreshOrders();
        } catch (error: unknown) {
            toast.error(getRequestErrorMessage(error, "Failed to complete delivery"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async () => {
        if (!cancelModal) return;
        setSubmitting(true);
        try {
            await axios.put(
                `${API_URL}/delivery/my-deliveries/${cancelModal}/cancel`,
                { reason: cancelReason },
                getAuthHeaders()
            );
            toast.success("Delivery cancelled");
            setCancelModal(null);
            setCancelReason("");
            refreshOrders();
        } catch (error: unknown) {
            toast.error(getRequestErrorMessage(error, "Failed to cancel delivery"));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="space-y-6">
            {/* Tabs + Tracking toggle */}
            <div className="flex items-center gap-2 flex-wrap">
                {(["active", "completed"] as const).map((t) => (
                    <button key={t} onClick={() => { if (t !== tab) setLoading(true); setTab(t); }} className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${tab === t ? "bg-app-green text-white" : "bg-white text-zinc-600 hover:bg-app-cream border border-app-border"}`}>
                        {t === "active" ? "Active" : "Completed"}
                    </button>
                ))}
                <div className="ml-auto">
                    <button onClick={handleToggleTracking} className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors flex items-center gap-1.5 ${tracking ? "bg-green-600 text-white" : "bg-white text-zinc-600 border border-app-border hover:bg-app-cream"}`}>
                        <NavigationIcon className={`w-3.5 h-3.5 ${tracking ? "animate-pulse" : ""}`} />
                        {tracking ? "Sharing Location" : "Share Location"}
                    </button>
                </div>
            </div>
            {locationError && <p role="alert" className="text-sm text-red-700">{locationError}</p>}

            {/* Orders */}
            {loading ? (
                <Loading />
            ) : error ? (
                <div role="alert" className="text-center py-12 bg-white rounded-2xl border border-app-border">
                    <p className="text-sm text-red-700 mb-4">Unable to load deliveries: {error}</p>
                    <button onClick={refreshOrders} className="px-4 py-2 text-sm font-medium bg-app-green text-white rounded-xl hover:bg-app-green-light transition-colors">
                        Retry
                    </button>
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-app-border">
                    <PackageIcon className="size-12 text-app-border mx-auto mb-3" />
                    <p className="text-lg font-semibold text-zinc-900 mb-1">No {tab} deliveries</p>
                    <p className="text-sm text-zinc-500">{tab === "active" ? "You'll see new assignments here" : "Completed deliveries will appear here"}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => <DeliveryOrderCard key={order.id} order={order} tab={tab} handleUpdateStatus={handleUpdateStatus} setOtpModal={setOtpModal} setCancelModal={setCancelModal} />)}
                </div>
            )}

            {/* OTP Modal */}
            {otpModal && <OtpModal setOtpModal={setOtpModal} otp={otp} setOtp={setOtp} handleComplete={handleComplete} submitting={submitting} />}
            {/* Cancel Modal */}
            {cancelModal && <CancelModal setCancelModal={setCancelModal} cancelReason={cancelReason} setCancelReason={setCancelReason} handleCancel={handleCancel} submitting={submitting} />}
        </div>
    );
}
