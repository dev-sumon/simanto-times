import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, FolderPlus } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { CategoryForm } from '@/components/admin/category-form';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import categories from '@/routes/admin/categories';

export default function CreateCategory() {
    return (
        <>
            <Head title="Create category" />

            <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <AdminPageHeader
                    title="Create category"
                    description="Add a section for news and articles."
                    icon={FolderPlus}
                >
                    <Button variant="outline" asChild>
                        <Link href={categories.index().url}>
                            <ArrowLeft className="h-4 w-4" /> Back to categories
                        </Link>
                    </Button>
                </AdminPageHeader>

                <div className="max-container rounded-xl border bg-card p-6 shadow-sm">
                    <CategoryForm
                        action={categories.store()}
                        onCancel={() => router.visit(categories.index().url)}
                    />
                </div>
            </div>
        </>
    );
}

CreateCategory.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Categories', href: categories.index() },
        { title: 'Create', href: categories.create() },
    ],
};
