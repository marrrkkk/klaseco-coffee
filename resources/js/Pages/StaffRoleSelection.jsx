import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";

export default function StaffRoleSelection({ intendedRole, availableRoles }) {
    const { data, setData, post, processing, errors } = useForm({
        role: intendedRole || "",
    });

    const [selectedRole, setSelectedRole] = useState(intendedRole || "");

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("staff.set-role"));
    };

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setData("role", role);
    };

    return (
        <>
            <Head title="Staff Access - KlaséCo" />

            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-10 h-10 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-amber-800 mb-2">
                            KlaséCo Staff
                        </h1>
                        <p className="text-amber-600">
                            Select your role to continue
                        </p>
                        {intendedRole && (
                            <p className="text-sm text-amber-500 mt-2">
                                Access required for:{" "}
                                {availableRoles[intendedRole]}
                            </p>
                        )}
                    </div>

                    {/* Role Selection Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            {Object.entries(availableRoles).map(
                                ([roleValue, roleLabel]) => (
                                    <button
                                        key={roleValue}
                                        type="button"
                                        onClick={() =>
                                            handleRoleSelect(roleValue)
                                        }
                                        className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                                            selectedRole === roleValue
                                                ? "border-amber-500 bg-amber-50 shadow-md"
                                                : "border-gray-200 hover:border-amber-300 hover:bg-amber-25"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold text-amber-800">
                                                    {roleLabel}
                                                </h3>
                                                <p className="text-sm text-amber-600">
                                                    {roleValue === "cashier"
                                                        ? "Manage incoming orders and customer service"
                                                        : "Prepare orders and manage coffee production"}
                                                </p>
                                            </div>
                                            <div
                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                                    selectedRole === roleValue
                                                        ? "border-amber-500 bg-amber-500"
                                                        : "border-gray-300"
                                                }`}
                                            >
                                                {selectedRole === roleValue && (
                                                    <svg
                                                        className="w-3 h-3 text-white"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                )
                            )}
                        </div>

                        {errors.role && (
                            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                                {errors.role}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={!selectedRole || processing}
                            className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
                        >
                            {processing ? "Accessing..." : "Continue"}
                        </button>
                    </form>

                    {/* Back to Menu Link */}
                    <div className="mt-6 text-center">
                        <a
                            href={route("home")}
                            className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                        >
                            ← Back to Customer Menu
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
