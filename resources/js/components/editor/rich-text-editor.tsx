import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { TableKit } from '@tiptap/extension-table';
import TextAlign from '@tiptap/extension-text-align';
import Youtube from '@tiptap/extension-youtube';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';
import { EditorToolbar } from '@/components/editor/editor-toolbar';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
    id?: string;
    value: string;
    onChange: (html: string) => void;
    onBlur?: () => void;
    placeholder?: string;
    disabled?: boolean;
    invalid?: boolean;
    className?: string;
    onUploadImage?: (file: File) => Promise<string>;
}

export function RichTextEditor({
    id,
    value,
    onChange,
    onBlur,
    placeholder = 'Write…',
    disabled = false,
    invalid = false,
    className,
    onUploadImage,
}: RichTextEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        shouldRerenderOnTransaction: true,
        editable: !disabled,
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3, 4] },
                link: {
                    openOnClick: false,
                    autolink: true,
                },
            }),
            Placeholder.configure({ placeholder }),
            Image.configure({
                inline: false,
                allowBase64: false,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Youtube.configure({
                modestBranding: true,
                width: 640,
                height: 360,
            }),
            TableKit.configure({
                table: { resizable: true },
            }),
        ],
        content: value || '',
        editorProps: {
            attributes: {
                id: id ?? '',
                class: cn(
                    'tiptap-editor min-h-64 px-3 py-2 text-sm focus-visible:outline-none',
                    className,
                ),
            },
        },
        onUpdate: ({ editor: instance }) => {
            onChange(instance.isEmpty ? '' : instance.getHTML());
        },
        onBlur: () => {
            onBlur?.();
        },
    });

    useEffect(() => {
        if (!editor) {
            return;
        }

        editor.setEditable(!disabled);
    }, [disabled, editor]);

    useEffect(() => {
        if (!editor || editor.isFocused) {
            return;
        }

        const next = value || '';
        const current = editor.isEmpty ? '' : editor.getHTML();

        if (next !== current) {
            editor.commands.setContent(next, { emitUpdate: false });
        }
    }, [value, editor]);

    return (
        <div
            className={cn(
                'overflow-hidden rounded-md border bg-transparent shadow-xs',
                'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
                invalid &&
                    'border-destructive ring-destructive/20 dark:ring-destructive/40',
            )}
        >
            <EditorToolbar
                editor={editor}
                disabled={disabled}
                onUploadImage={onUploadImage}
            />
            <EditorContent editor={editor} />
        </div>
    );
}
