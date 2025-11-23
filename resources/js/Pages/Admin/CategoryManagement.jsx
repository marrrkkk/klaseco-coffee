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

export default function CategoryManagement({ categories, flash }) {
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [notification, setNotification] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: "",
        slug: "",
        image_url: "",
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
        setEditingCategory(null);
        reset();
        setShowModal(true);
    };

    const openEditModal = (category) => {
        setEditingCategory(category);
        setData({
            name: category.name,
            slug: category.slug,
            image_url: category.image_url || "",
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingCategory(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingCategory) {
            put(route("admin.categories.update", editingCategory.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route("admin.categories.store"), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (category) => {
        setCategoryToDelete(category);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        if (categoryToDelete) {
            router.delete(
                route("admin.categories.destroy", categoryToDelete.id),
                {
                    onSuccess: () => {
                        setShowDeleteConfirm(false);
                        setCategoryToDelete(null);
                    },
                }
            );
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setCategoryToDelete(null);
    };

    // Auto-generate slug from name
    const handleNameChange = (e) => {
        const name = e.target.value;
        setData("name", name);

        // Only auto-generate slug if creating new category
        if (!editingCategory) {
            const slug = name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");
            setData("slug", slug);
        }
    };

    return (
        <AdminLayout title="Category Management">
            <Head title="Categories - Admin" />

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
                            Categories
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Manage product categories for your menu
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
                        Create Category
                    </button>
                </div>

                {/* Categories List */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    {categories && categories.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Name
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Slug
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Products
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Image
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
                                {categories.map((category) => (
                                    <tr
                                        key={category.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {category.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {category.slug}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {category.menu_items_count || 0}{" "}
                                                products
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {category.image_url ? (
                                                <img
                                                    src={category.image_url}
                                                    alt={category.name}
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
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() =>
                                                    openEditModal(category)
                                                }
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(category)
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
                                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                No categories
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Get started by creating a new category.
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
                                    Create Category
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create/Edit Modal */}
            <Modal show={showModal} onClose={closeModal} maxWidth="lg">
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        {editingCategory ? "Edit Category" : "Create Category"}
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Name" />
                            <TextInput
                                id="name"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={handleNameChange}
                                required
                                error={!!errors.name}
                            />
                            <InputError
                                message={errors.name}
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="slug" value="Slug" />
                            <TextInput
                                id="slug"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.slug}
                                onChange={(e) =>
                                    setData("slug", e.target.value)
                                }
                                required
                                error={!!errors.slug}
                            />
                            <InputError
                                message={errors.slug}
                                className="mt-2"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                URL-friendly version (lowercase, hyphens only)
                            </p>
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
                                : editingCategory
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
                                Delete Category
                            </h3>
                        </div>
                    </div>

                    <p className="text-sm text-gray-500 mb-4">
                        Are you sure you want to delete "
                        {categoryToDelete?.name}"?
                        {categoryToDelete?.menu_items_count > 0 && (
                            <span className="block mt-2 text-red-600 font-medium">
                                This category has{" "}
                                {categoryToDelete.menu_items_count} product(s).
                                You cannot delete a category with existing
                                products.
                            </span>
                        )}
                    </p>

                    <div className="flex justify-end space-x-3">
                        <SecondaryButton onClick={cancelDelete}>
                            Cancel
                        </SecondaryButton>
                        <DangerButton
                            onClick={confirmDelete}
                            disabled={categoryToDelete?.menu_items_count > 0}
                        >
                            Delete
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}
