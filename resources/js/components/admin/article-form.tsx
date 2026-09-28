import type { UrlMethodPair } from '@inertiajs/core';
import { useForm } from '@inertiajs/react';
import { Clock, Loader2, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { useMemo } from 'react';
import FileUpload from '@/components/file-upload';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { ArticleCategoryOption, EnumOption } from '@/types/admin';

function toSlug(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function readingMinutes(content: string): number {
    const words = content.trim().split(/\s+/).filter(Boolean).length;

    if (words === 0) {
        return 0;
    }

    return Math.max(1, Math.ceil(words / 200));
}

export interface ArticleFormDefaults {
    title: string;
    slug: string;
    category_id: number | null;
    excerpt: string;
    content: string;
    status: string;
    visibility: string;
    is_featured: boolean;
    is_breaking: boolean;
    is_trending: boolean;
    published_at: string;
    scheduled_at: string;
    seo_title: string;
    seo_description: string;
    seo_keywords: string;
    canonical_url: string;
}

interface ArticleFormProps {
    action: UrlMethodPair;
    categories: ArticleCategoryOption[];
    statusOptions: EnumOption[];
    visibilityOptions: EnumOption[];
    isEdit?: boolean;
    defaults?: Partial<ArticleFormDefaults>;
    onCancel?: () => void;
}

export function ArticleForm({
    action,
    categories,
    statusOptions,
    visibilityOptions,
    isEdit = false,
    defaults,
    onCancel,
}: ArticleFormProps) {
    const defaultStatus = statusOptions[0]?.value ?? 'draft';
    const defaultVisibility = visibilityOptions[0]?.value ?? 'public';

    const form = useForm(action, {
        title: defaults?.title ?? '',
        slug: defaults?.slug ?? '',
        category_id: defaults?.category_id ?? null,
        excerpt: defaults?.excerpt ?? '',
        content: defaults?.content ?? '',
        featured_image: null as File | null,
        status: defaults?.status ?? defaultStatus,
        visibility: defaults?.visibility ?? defaultVisibility,
        is_featured: defaults?.is_featured ?? false,
        is_breaking: defaults?.is_breaking ?? false,
        is_trending: defaults?.is_trending ?? false,
        published_at: defaults?.published_at ?? '',
        scheduled_at: defaults?.scheduled_at ?? '',
        seo_title: defaults?.seo_title ?? '',
        seo_description: defaults?.seo_description ?? '',
        seo_keywords: defaults?.seo_keywords ?? '',
        canonical_url: defaults?.canonical_url ?? '',
    });

    const slugPreview = useMemo(
        () => form.data.slug.trim() || toSlug(form.data.title) || 'article',
        [form.data.title, form.data.slug],
    );

    const minutes = useMemo(
        () => readingMinutes(form.data.content),
        [form.data.content],
    );

    const keywordChips = useMemo(
        () =>
            form.data.seo_keywords
                .split(',')
                .map((keyword) => keyword.trim())
                .filter(Boolean),
        [form.data.seo_keywords],
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.submit({
            preserveScroll: true,
            onSuccess: () => {
                if (!isEdit) {
                    form.reset();
                }
            },
        });
    };

    return (
        <motion.form
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleSubmit}
            className="space-y-6"
        >
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Story</CardTitle>
                            <CardDescription>
                                Headline, URL, and the article body.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={form.data.title}
                                    onChange={(e) =>
                                        form.setData('title', e.target.value)
                                    }
                                    onBlur={() => form.validate('title')}
                                    aria-invalid={form.invalid('title')}
                                    placeholder="e.g. Heavy rain floods downtown"
                                />
                                <InputError message={form.errors.title} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    value={form.data.slug}
                                    onChange={(e) =>
                                        form.setData('slug', e.target.value)
                                    }
                                    onBlur={() => form.validate('slug')}
                                    aria-invalid={form.invalid('slug')}
                                    placeholder="Leave blank to generate from the title"
                                />
                                <p className="text-xs text-muted-foreground">
                                    URL key:{' '}
                                    <span className="font-medium text-foreground">
                                        {slugPreview}
                                    </span>
                                </p>
                                <InputError message={form.errors.slug} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="excerpt">Excerpt</Label>
                                <Textarea
                                    id="excerpt"
                                    value={form.data.excerpt}
                                    onChange={(e) =>
                                        form.setData('excerpt', e.target.value)
                                    }
                                    onBlur={() => form.validate('excerpt')}
                                    aria-invalid={form.invalid('excerpt')}
                                    placeholder="A short summary for listings and social previews"
                                    className="min-h-24"
                                />
                                <InputError message={form.errors.excerpt} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center justify-between gap-3">
                                    <Label htmlFor="content">Content</Label>
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="size-3.5" />
                                        {minutes === 0
                                            ? '0 min read'
                                            : `${minutes} min read`}
                                    </span>
                                </div>
                                <Textarea
                                    id="content"
                                    value={form.data.content}
                                    onChange={(e) =>
                                        form.setData('content', e.target.value)
                                    }
                                    onBlur={() => form.validate('content')}
                                    aria-invalid={form.invalid('content')}
                                    placeholder="Write the full article…"
                                    className="min-h-64"
                                />
                                <InputError message={form.errors.content} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Featured image</CardTitle>
                            <CardDescription>
                                Used on listing cards and the article header.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FileUpload
                                accept="image/*"
                                maxSize={4}
                                value={form.data.featured_image}
                                onChange={(file) =>
                                    form.setData(
                                        'featured_image',
                                        (file as File | null) ?? null,
                                    )
                                }
                                isUploading={form.processing}
                                uploadProgress={
                                    form.progress?.percentage ?? null
                                }
                                placeholder="Drag & drop a cover image, or click to browse"
                                hint="PNG, JPG or WEBP up to 4 MB"
                                error={form.errors.featured_image}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>SEO</CardTitle>
                            <CardDescription>
                                Optional overrides. Title, description, and
                                canonical URL fall back automatically.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="grid gap-2">
                                <Label htmlFor="seo_title">SEO title</Label>
                                <Input
                                    id="seo_title"
                                    value={form.data.seo_title}
                                    onChange={(e) =>
                                        form.setData(
                                            'seo_title',
                                            e.target.value,
                                        )
                                    }
                                    onBlur={() => form.validate('seo_title')}
                                    aria-invalid={form.invalid('seo_title')}
                                    placeholder="Defaults to the article title"
                                />
                                <InputError message={form.errors.seo_title} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="seo_description">
                                    SEO description
                                </Label>
                                <Textarea
                                    id="seo_description"
                                    value={form.data.seo_description}
                                    onChange={(e) =>
                                        form.setData(
                                            'seo_description',
                                            e.target.value,
                                        )
                                    }
                                    onBlur={() =>
                                        form.validate('seo_description')
                                    }
                                    aria-invalid={form.invalid(
                                        'seo_description',
                                    )}
                                    placeholder="Defaults to the excerpt"
                                    className="min-h-20"
                                />
                                <InputError
                                    message={form.errors.seo_description}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="seo_keywords">
                                    SEO keywords
                                </Label>
                                <Input
                                    id="seo_keywords"
                                    value={form.data.seo_keywords}
                                    onChange={(e) =>
                                        form.setData(
                                            'seo_keywords',
                                            e.target.value,
                                        )
                                    }
                                    onBlur={() =>
                                        form.validate('seo_keywords')
                                    }
                                    aria-invalid={form.invalid('seo_keywords')}
                                    placeholder="Comma-separated, e.g. weather, city, flood"
                                />
                                {keywordChips.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {keywordChips.map((keyword) => (
                                            <Badge
                                                key={keyword}
                                                variant="secondary"
                                            >
                                                {keyword}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                                <InputError
                                    message={form.errors.seo_keywords}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="canonical_url">
                                    Canonical URL
                                </Label>
                                <Input
                                    id="canonical_url"
                                    value={form.data.canonical_url}
                                    onChange={(e) =>
                                        form.setData(
                                            'canonical_url',
                                            e.target.value,
                                        )
                                    }
                                    onBlur={() =>
                                        form.validate('canonical_url')
                                    }
                                    aria-invalid={form.invalid('canonical_url')}
                                    placeholder={`/articles/${slugPreview}`}
                                />
                                <InputError
                                    message={form.errors.canonical_url}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6 lg:sticky lg:top-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Publish</CardTitle>
                            <CardDescription>
                                Status, visibility, and schedule.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={form.data.status}
                                    onValueChange={(value) =>
                                        form.setData('status', value)
                                    }
                                >
                                    <SelectTrigger
                                        id="status"
                                        className="w-full"
                                        aria-invalid={form.invalid('status')}
                                    >
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={form.errors.status} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="visibility">Visibility</Label>
                                <Select
                                    value={form.data.visibility}
                                    onValueChange={(value) =>
                                        form.setData('visibility', value)
                                    }
                                >
                                    <SelectTrigger
                                        id="visibility"
                                        className="w-full"
                                        aria-invalid={form.invalid(
                                            'visibility',
                                        )}
                                    >
                                        <SelectValue placeholder="Select visibility" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {visibilityOptions.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={form.errors.visibility} />
                            </div>

                            {form.data.status === 'published' && (
                                <div className="grid gap-2">
                                    <Label htmlFor="published_at">
                                        Published at
                                    </Label>
                                    <Input
                                        id="published_at"
                                        type="datetime-local"
                                        value={form.data.published_at}
                                        onChange={(e) =>
                                            form.setData(
                                                'published_at',
                                                e.target.value,
                                            )
                                        }
                                        aria-invalid={form.invalid(
                                            'published_at',
                                        )}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Leave blank to use the current time.
                                    </p>
                                    <InputError
                                        message={form.errors.published_at}
                                    />
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="scheduled_at">
                                    Scheduled at
                                </Label>
                                <Input
                                    id="scheduled_at"
                                    type="datetime-local"
                                    value={form.data.scheduled_at}
                                    onChange={(e) =>
                                        form.setData(
                                            'scheduled_at',
                                            e.target.value,
                                        )
                                    }
                                    aria-invalid={form.invalid('scheduled_at')}
                                />
                                <InputError
                                    message={form.errors.scheduled_at}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Placement</CardTitle>
                            <CardDescription>
                                Category and homepage flags.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="grid gap-2">
                                <Label htmlFor="category_id">Category</Label>
                                <Select
                                    value={
                                        form.data.category_id === null
                                            ? 'none'
                                            : String(form.data.category_id)
                                    }
                                    onValueChange={(value) =>
                                        form.setData(
                                            'category_id',
                                            value === 'none'
                                                ? null
                                                : Number(value),
                                        )
                                    }
                                >
                                    <SelectTrigger
                                        id="category_id"
                                        className="w-full"
                                        aria-invalid={form.invalid(
                                            'category_id',
                                        )}
                                    >
                                        <SelectValue placeholder="Uncategorized" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            Uncategorized
                                        </SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem
                                                key={category.id}
                                                value={String(category.id)}
                                            >
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError
                                    message={form.errors.category_id}
                                />
                            </div>

                            <FlagSwitch
                                id="is_featured"
                                label="Featured"
                                description="Highlight on the homepage."
                                checked={form.data.is_featured}
                                onCheckedChange={(checked) =>
                                    form.setData('is_featured', checked)
                                }
                            />
                            <FlagSwitch
                                id="is_breaking"
                                label="Breaking"
                                description="Show in the breaking news strip."
                                checked={form.data.is_breaking}
                                onCheckedChange={(checked) =>
                                    form.setData('is_breaking', checked)
                                }
                            />
                            <FlagSwitch
                                id="is_trending"
                                label="Trending"
                                description="Include in trending lists."
                                checked={form.data.is_trending}
                                onCheckedChange={(checked) =>
                                    form.setData('is_trending', checked)
                                }
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="sticky bottom-0 z-10 flex items-center gap-3 border-t bg-background/95 py-4 backdrop-blur">
                <Button type="submit" disabled={form.processing}>
                    {form.processing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    {isEdit ? 'Save changes' : 'Create article'}
                </Button>
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={form.processing}
                    >
                        Cancel
                    </Button>
                )}
                {form.validating && (
                    <Badge variant="secondary" className="gap-1.5">
                        <Loader2 className="h-3 w-3 animate-spin" /> Validating…
                    </Badge>
                )}
            </div>
        </motion.form>
    );
}

function FlagSwitch({
    id,
    label,
    description,
    checked,
    onCheckedChange,
}: {
    id: string;
    label: string;
    description: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}) {
    return (
        <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
            <div className="grid gap-0.5">
                <Label htmlFor={id}>{label}</Label>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <Switch
                id={id}
                checked={checked}
                onCheckedChange={onCheckedChange}
            />
        </div>
    );
}
