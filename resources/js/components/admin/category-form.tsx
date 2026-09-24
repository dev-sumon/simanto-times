import type { UrlMethodPair } from '@inertiajs/core';
import { useForm } from '@inertiajs/react';
import { Loader2, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { useMemo } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function toSlug(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

interface CategoryFormProps {
    action: UrlMethodPair;
    isEdit?: boolean;
    defaults?: { name: string; slug: string };
    onCancel?: () => void;
}

export function CategoryForm({
    action,
    isEdit = false,
    defaults,
    onCancel,
}: CategoryFormProps) {
    const form = useForm(action, {
        name: defaults?.name ?? '',
        slug: defaults?.slug ?? '',
    });

    const slugPreview = useMemo(
        () => form.data.slug.trim() || toSlug(form.data.name) || 'category',
        [form.data.name, form.data.slug],
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
            <div className="grid gap-2 w-full mb-4">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    value={form.data.name}
                    onChange={(e) => form.setData('name', e.target.value)}
                    onBlur={() => form.validate('name')}
                    aria-invalid={form.invalid('name')}
                    placeholder="e.g. National"
                />
                <InputError message={form.errors.name} />
            </div>

            <div className="grid gap-2 w-full">
                <Label htmlFor="slug">Slug</Label>
                <Input
                    id="slug"
                    value={form.data.slug}
                    onChange={(e) => form.setData('slug', e.target.value)}
                    onBlur={() => form.validate('slug')}
                    aria-invalid={form.invalid('slug')}
                    placeholder="Leave blank to generate from the name"
                />
                <p className="text-xs text-muted-foreground">
                    URL key:{' '}
                    <span className="font-medium text-foreground">
                        {slugPreview}
                    </span>
                </p>
                <InputError message={form.errors.slug} />
            </div>

            <div className="flex items-center gap-3 border-t pt-5">
                <Button type="submit" disabled={form.processing}>
                    {form.processing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    {isEdit ? 'Save changes' : 'Create category'}
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
            </div>
        </motion.form>
    );
}
