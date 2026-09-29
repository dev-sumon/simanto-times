import type { Editor } from '@tiptap/react';
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold,
    Code,
    Heading2,
    ImagePlus,
    Italic,
    Link2,
    List,
    ListOrdered,
    Minus,
    Quote,
    Redo2,
    RemoveFormatting,
    Strikethrough,
    Table,
    Underline,
    Undo2,
    Youtube,
} from 'lucide-react';
import { useRef, type ReactNode } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface EditorToolbarProps {
    editor: Editor | null;
    disabled?: boolean;
    onUploadImage?: (file: File) => Promise<string>;
}

export function EditorToolbar({
    editor,
    disabled = false,
    onUploadImage,
}: EditorToolbarProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const canEdit = Boolean(editor) && !disabled;

    const headingLabel = editor?.isActive('heading', { level: 2 })
        ? 'Heading 2'
        : editor?.isActive('heading', { level: 3 })
          ? 'Heading 3'
          : editor?.isActive('heading', { level: 4 })
            ? 'Heading 4'
            : 'Paragraph';

    const setLink = () => {
        if (!editor) {
            return;
        }

        const previous = editor.getAttributes('link').href as
            | string
            | undefined;
        const url = window.prompt('Link URL', previous ?? 'https://');

        if (url === null) {
            return;
        }

        if (url.trim() === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();

            return;
        }

        editor
            .chain()
            .focus()
            .extendMarkRange('link')
            .setLink({ href: url.trim() })
            .run();
    };

    const embedYoutube = () => {
        if (!editor) {
            return;
        }

        const url = window.prompt('YouTube URL');

        if (!url?.trim()) {
            return;
        }

        editor.commands.setYoutubeVideo({ src: url.trim() });
    };

    const insertTable = () => {
        editor
            ?.chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run();
    };

    const pickImage = () => {
        fileInputRef.current?.click();
    };

    const handleImage = async (file: File | undefined) => {
        if (!file || !editor || !onUploadImage) {
            return;
        }

        try {
            const url = await onUploadImage(file);
            editor.chain().focus().setImage({ src: url }).run();
        } catch {
            toast.error('Image upload failed. Try another file.');
        }
    };

    return (
        <TooltipProvider>
            <div className="flex flex-wrap items-center gap-0.5 border-b p-1.5">
                <ToolbarTip label="Undo">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={!canEdit || !editor?.can().undo()}
                        onClick={() => editor?.chain().focus().undo().run()}
                    >
                        <Undo2 />
                    </Button>
                </ToolbarTip>
                <ToolbarTip label="Redo">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={!canEdit || !editor?.can().redo()}
                        onClick={() => editor?.chain().focus().redo().run()}
                    >
                        <Redo2 />
                    </Button>
                </ToolbarTip>

                <ToolbarSep />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={!canEdit}
                            className="gap-1 px-2"
                        >
                            <Heading2 className="size-4" />
                            <span className="hidden text-xs sm:inline">
                                {headingLabel}
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem
                            onClick={() =>
                                editor?.chain().focus().setParagraph().run()
                            }
                        >
                            Paragraph
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() =>
                                editor
                                    ?.chain()
                                    .focus()
                                    .toggleHeading({ level: 2 })
                                    .run()
                            }
                        >
                            Heading 2
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() =>
                                editor
                                    ?.chain()
                                    .focus()
                                    .toggleHeading({ level: 3 })
                                    .run()
                            }
                        >
                            Heading 3
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() =>
                                editor
                                    ?.chain()
                                    .focus()
                                    .toggleHeading({ level: 4 })
                                    .run()
                            }
                        >
                            Heading 4
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <ToolbarSep />

                <MarkToggle
                    label="Bold"
                    pressed={editor?.isActive('bold')}
                    disabled={!canEdit}
                    onPressedChange={() =>
                        editor?.chain().focus().toggleBold().run()
                    }
                >
                    <Bold />
                </MarkToggle>
                <MarkToggle
                    label="Italic"
                    pressed={editor?.isActive('italic')}
                    disabled={!canEdit}
                    onPressedChange={() =>
                        editor?.chain().focus().toggleItalic().run()
                    }
                >
                    <Italic />
                </MarkToggle>
                <MarkToggle
                    label="Underline"
                    pressed={editor?.isActive('underline')}
                    disabled={!canEdit}
                    onPressedChange={() =>
                        editor?.chain().focus().toggleUnderline().run()
                    }
                >
                    <Underline />
                </MarkToggle>
                <MarkToggle
                    label="Strikethrough"
                    pressed={editor?.isActive('strike')}
                    disabled={!canEdit}
                    onPressedChange={() =>
                        editor?.chain().focus().toggleStrike().run()
                    }
                >
                    <Strikethrough />
                </MarkToggle>
                <MarkToggle
                    label="Inline code"
                    pressed={editor?.isActive('code')}
                    disabled={!canEdit}
                    onPressedChange={() =>
                        editor?.chain().focus().toggleCode().run()
                    }
                >
                    <Code />
                </MarkToggle>

                <ToolbarSep />

                <MarkToggle
                    label="Align left"
                    pressed={editor?.isActive({ textAlign: 'left' })}
                    disabled={!canEdit}
                    onPressedChange={() =>
                        editor?.chain().focus().setTextAlign('left').run()
                    }
                >
                    <AlignLeft />
                </MarkToggle>
                <MarkToggle
                    label="Align center"
                    pressed={editor?.isActive({ textAlign: 'center' })}
                    disabled={!canEdit}
                    onPressedChange={() =>
                        editor?.chain().focus().setTextAlign('center').run()
                    }
                >
                    <AlignCenter />
                </MarkToggle>
                <MarkToggle
                    label="Align right"
                    pressed={editor?.isActive({ textAlign: 'right' })}
                    disabled={!canEdit}
                    onPressedChange={() =>
                        editor?.chain().focus().setTextAlign('right').run()
                    }
                >
                    <AlignRight />
                </MarkToggle>

                <ToolbarSep />

                <MarkToggle
                    label="Bullet list"
                    pressed={editor?.isActive('bulletList')}
                    disabled={!canEdit}
                    onPressedChange={() =>
                        editor?.chain().focus().toggleBulletList().run()
                    }
                >
                    <List />
                </MarkToggle>
                <MarkToggle
                    label="Numbered list"
                    pressed={editor?.isActive('orderedList')}
                    disabled={!canEdit}
                    onPressedChange={() =>
                        editor?.chain().focus().toggleOrderedList().run()
                    }
                >
                    <ListOrdered />
                </MarkToggle>
                <MarkToggle
                    label="Quote"
                    pressed={editor?.isActive('blockquote')}
                    disabled={!canEdit}
                    onPressedChange={() =>
                        editor?.chain().focus().toggleBlockquote().run()
                    }
                >
                    <Quote />
                </MarkToggle>
                <ToolbarTip label="Horizontal rule">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={!canEdit}
                        onClick={() =>
                            editor?.chain().focus().setHorizontalRule().run()
                        }
                    >
                        <Minus />
                    </Button>
                </ToolbarTip>

                <ToolbarSep />

                <ToolbarTip label="Link">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={!canEdit}
                        onClick={setLink}
                    >
                        <Link2 />
                    </Button>
                </ToolbarTip>

                {onUploadImage && (
                    <>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="sr-only"
                            onChange={(e) => {
                                void handleImage(e.target.files?.[0]);
                                e.target.value = '';
                            }}
                        />
                        <ToolbarTip label="Image">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                disabled={!canEdit}
                                onClick={pickImage}
                            >
                                <ImagePlus />
                            </Button>
                        </ToolbarTip>
                    </>
                )}

                <ToolbarTip label="YouTube">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={!canEdit}
                        onClick={embedYoutube}
                    >
                        <Youtube />
                    </Button>
                </ToolbarTip>
                <ToolbarTip label="Insert table">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={!canEdit}
                        onClick={insertTable}
                    >
                        <Table />
                    </Button>
                </ToolbarTip>
                <ToolbarTip label="Clear formatting">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={!canEdit}
                        onClick={() =>
                            editor
                                ?.chain()
                                .focus()
                                .unsetAllMarks()
                                .clearNodes()
                                .run()
                        }
                    >
                        <RemoveFormatting />
                    </Button>
                </ToolbarTip>
            </div>
        </TooltipProvider>
    );
}

function ToolbarSep() {
    return (
        <Separator orientation="vertical" className="mx-1 h-6 self-center" />
    );
}

function ToolbarTip({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
        </Tooltip>
    );
}

function MarkToggle({
    label,
    pressed,
    disabled,
    onPressedChange,
    children,
}: {
    label: string;
    pressed?: boolean;
    disabled?: boolean;
    onPressedChange: () => void;
    children: ReactNode;
}) {
    return (
        <ToolbarTip label={label}>
            <Toggle
                size="sm"
                pressed={pressed ?? false}
                disabled={disabled}
                onPressedChange={onPressedChange}
                aria-label={label}
                className="size-8 p-0"
            >
                {children}
            </Toggle>
        </ToolbarTip>
    );
}
