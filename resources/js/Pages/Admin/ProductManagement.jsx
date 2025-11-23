import { Head, useForm, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { useState, useEffect } from "react";
import Modal from "@/Components/Modal";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import DangerButton from "@/Components/DangerButton";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";

export default function ProductManagement({
    products,
    categories,
    filters,
    flash,
}) {
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [notification, setNotification] = useState(null);

    // Filter state
    const [filterCategory, setFilterCategory] = useState(
        filters.category_id || ""
    );
    const [filterAvailability, setFilterAvailability] = useState(
        filters.is_available ?? ""
    );
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [sortBy, setSortBy] = useState(filters.sort_by || "name");
    const [sortOrder, setSortOrder] = useState(filters.sort_order || "asc");

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: "",
        description: "",
        category_id: "",
        base_price: "",
        image_url: "",
        is_available: true,
    });

    // Show flash messages
    useEffect(() => {
        if (flash?.success) {
            setNotification({ type: "success", message: flash.success });
            setTimeout(() => setNotification(null), 5000);
        }
        if (flash?.error) {
            setNotification({ type: "error", message: flash.error });
            setTimeout(() => setNotification(null), 5000);
        }
    }, [flash]);

    const openCreateModal = () => {
        setEditingProduct(null);
        reset();
        setShowModal(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setData({
            name: product.name,
            description: product.description,
            category_id: product.category_id,
            base_price: product.base_price,
            image_url: product.image_url || "",
            is_available: product.is_available,
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingProduct(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingProduct) {
            put(route("admin.products.update", editingProduct.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route("admin.products.store"), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (product) => {
        setProductToDelete(product);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        if (productToDelete) {
            router.delete(route("admin.products.destroy", productToDelete.id), {
                onSuccess: () => {
                    setShowDeleteConfirm(false);
                    setProductToDelete(null);
                },
            });
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setProductToDelete(null);
    };

    const handleToggleAvailability = (product) => {
        router.post(
            route("admin.products.toggle-availability", product.id),
            {},
            {
                preserveScroll: true,
            }
        );
    };

    const applyFilters = () => {
        router.get(
            route("admin.products.index"),
            {
                category_id: filterCategory || undefined,
                is_available:
                    filterAvailability !== "" ? filterAvailability : undefined,
                search: searchTerm || undefined,
                sort_by: sortBy,
                sort_order: sortOrder,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const clearFilters = () => {
        setFilterCategory("");
        setFilterAvailability("");
        setSearchTerm("");
        setSortBy("name");
        setSortOrder("asc");
        router.get(route("admin.products.index"));
    };

    const formatPrice = (price) => {
        return parseFloat(price).toFixed(2);
    };

    return (
        <AdminLayout title="Product Management">
            <Head title="Products - Admin" />

            {/* Notification */}
            {notification && (
                <div
                    className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg animate-slide-down ${
                        notification.type === "success"
                            ? "bg-green-50 border border-green-200"
                            : "bg-red-50 border border-red-200"
                    }`}
                >
                    <div className="flex items-center space-x-3">
                        {notification.type === "success" ? (
                            <svg
                                className="w-5 h-5 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="w-5 h-5 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        )}
                        <p
                            className={`text-sm font-medium ${
                                notification.type === "success"
                                    ? "text-green-800"
                                    : "text-red-800"
                            }`}
                        >
                            {notification.message}
                        </p>
                        <button
                            onClick={() => setNotification(null)}
                            className={`ml-4 ${
                                notification.type === "success"
                                    ? "text-green-600 hover:text-green-800"
                                    : "text-red-600 hover:text-red-800"
                            }`}
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                {/* Header with Create Button */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-medium text-gray-900">
                            Products
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Manage menu items and their availability
                        </p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                    >
                        <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                        Create Product
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white shadow rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            <select
                                value={filterCategory}
                                onChange={(e) =>
                                    setFilterCategory(e.target.value)
                                }
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                                <option value="">All Categories</option>
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Availability
                            </label>
                            <select
                                value={filterAvailability}
                                onChange={(e) =>
                                    setFilterAvailability(e.target.value)
                                }
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                                <option value="">All</option>
                                <option value="1">Available</option>
                                <option value="0">Unavailable</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Search
                            </label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search products..."
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sort By
                            </label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                                <option value="name">Name</option>
                                <option value="base_price">Price</option>
                                <option value="created_at">Date Created</option>
                                <option value="is_available">
                                    Availability
                                </option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Order
                            </label>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => {
                                        setSortOrder("asc");
                                    }}
                                    className={`flex-1 px-3 py-2 text-sm rounded-md ${
                                        sortOrder === "asc"
                                            ? "bg-gray-800 text-white"
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                                >
                                    Asc
                                </button>
                                <button
                                    onClick={() => {
                                        setSortOrder("desc");
                                    }}
                                    className={`flex-1 px-3 py-2 text-sm rounded-md ${
                                        sortOrder === "desc"
                                            ? "bg-gray-800 text-white"
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                                >
                                    Desc
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end space-x-2">
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Clear
                        </button>
                        <button
                            onClick={applyFilters}
                            className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>

                {/* Products List */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    {products && products.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Product
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Category
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Price
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Status
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {products.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                {product.image_url ? (
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        className="h-10 w-10 rounded object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                                                        <svg
                                                            className="h-6 w-6 text-gray-400"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                            />
                                                        </svg>
                                                    </div>
                                                )}
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {product.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 max-w-xs truncate">
                                                        {product.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {product.category?.name ||
                                                    "N/A"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                ₱
                                                {formatPrice(
                                                    product.base_price
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() =>
                                                    handleToggleAvailability(
                                                        product
                                                    )
                                                }
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    product.is_available
                                                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                                                        : "bg-red-100 text-red-800 hover:bg-red-200"
                                                }`}
                                            >
                                                {product.is_available
                                                    ? "Available"
                                                    : "Unavailable"}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() =>
                                                    openEditModal(product)
                                                }
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(product)
                                                }
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-12">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                No products
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Get started by creating a new product.
                            </p>
                            <div className="mt-6">
                                <button
                                    onClick={openCreateModal}
                                    className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 4v16m8-8H4"
                                        />
                                    </svg>
                                    Create Product
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create/Edit Modal */}
            <Modal show={showModal} onClose={closeModal} maxWidth="2xl">
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        {editingProduct ? "Edit Product" : "Create Product"}
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Name" />
                            <TextInput
                                id="name"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                required
                                error={!!errors.name}
                            />
                            <InputError
                                message={errors.name}
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="description"
                                value="Description"
                            />
                            <textarea
                                id="description"
                                className={`mt-1 block w-full rounded-md shadow-sm ${
                                    errors.description
                                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                        : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                }`}
                                value={data.description}
                                onChange={(e) =>
                                    setData("description", e.target.value)
                                }
                                rows="3"
                                required
                            />
                            <InputError
                                message={errors.description}
                                className="mt-2"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel
                                    htmlFor="category_id"
                                    value="Category"
                                />
                                <select
                                    id="category_id"
                                    className={`mt-1 block w-full rounded-md shadow-sm ${
                                        errors.category_id
                                            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                    }`}
                                    value={data.category_id}
                                    onChange={(e) =>
                                        setData("category_id", e.target.value)
                                    }
                                    required
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError
                                    message={errors.category_id}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="base_price"
                                    value="Base Price (₱)"
                                />
                                <TextInput
                                    id="base_price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="99999.99"
                                    className="mt-1 block w-full"
                                    value={data.base_price}
                                    onChange={(e) =>
                                        setData("base_price", e.target.value)
                                    }
                                    required
                                    error={!!errors.base_price}
                                />
                                <InputError
                                    message={errors.base_price}
                                    className="mt-2"
                                />
                            </div>
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="image_url"
                                value="Image URL (Optional)"
                            />
                            <TextInput
                                id="image_url"
                                type="url"
                                className="mt-1 block w-full"
                                value={data.image_url}
                                onChange={(e) =>
                                    setData("image_url", e.target.value)
                                }
                                error={!!errors.image_url}
                            />
                            <InputError
                                message={errors.image_url}
                                className="mt-2"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                id="is_available"
                                type="checkbox"
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                checked={data.is_available}
                                onChange={(e) =>
                                    setData("is_available", e.target.checked)
                                }
                            />
                            <label
                                htmlFor="is_available"
                                className="ml-2 block text-sm text-gray-900"
                            >
                                Available for ordering
                            </label>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <SecondaryButton type="button" onClick={closeModal}>
                            Cancel
                        </SecondaryButton>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50"
                        >
                            {processing
                                ? "Saving..."
                                : editingProduct
                                ? "Update"
                                : "Create"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                show={showDeleteConfirm}
                onClose={cancelDelete}
                maxWidth="md"
            >
                <div className="p-6">
                    <div className="flex items-center mb-4">
                        <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                            <svg
                                className="h-6 w-6 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Delete Product
                            </h3>
                        </div>
                    </div>

                    <p className="text-sm text-gray-500 mb-4">
                        Are you sure you want to delete "{productToDelete?.name}
                        "? This action cannot be undone, but order history will
                        be preserved.
                    </p>

                    <div className="flex justify-end space-x-3">
                        <SecondaryButton onClick={cancelDelete}>
                            Cancel
                        </SecondaryButton>
                        <DangerButton onClick={confirmDelete}>
                            Delete
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}
