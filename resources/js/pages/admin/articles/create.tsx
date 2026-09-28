import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Newspaper } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { ArticleForm } from '@/components/admin/article-form';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import articles from '@/routes/admin/articles';
import type { ArticleCategoryOption, EnumOption } from '@/types/admin';

interface CreateArticleProps {
    categories: ArticleCategoryOption[];
    statusOptions: EnumOption[];
    visibilityOptions: EnumOption[];
}

export default function CreateArticle({
    categories,
    statusOptions,
    visibilityOptions,
}: CreateArticleProps) {
    return (
        <>
            <Head title="Create article" />

            <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <AdminPageHeader
                    title="Create article"
                    description="Write a story, set publishing options, and add SEO."
                    icon={Newspaper}
                >
                    <Button variant="outline" asChild>
                        <Link href={articles.index().url}>
                            <ArrowLeft className="h-4 w-4" /> Back to articles
                        </Link>
                    </Button>
                </AdminPageHeader>

                <ArticleForm
                    action={articles.store()}
                    categories={categories}
                    statusOptions={statusOptions}
                    visibilityOptions={visibilityOptions}
                    onCancel={() => router.visit(articles.index().url)}
                />
            </div>
        </>
    );
}

CreateArticle.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Articles', href: articles.index() },
        { title: 'Create', href: articles.create() },
    ],
};
