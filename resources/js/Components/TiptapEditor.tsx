import React, { useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import Heading from "@tiptap/extension-heading";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";

import {
    BoldOutlined,
    ItalicOutlined,
    UnderlineOutlined,
    StrikethroughOutlined,
    OrderedListOutlined,
    UnorderedListOutlined,
    CodeOutlined,
    BlockOutlined,
    UndoOutlined,
    RedoOutlined,
    FontSizeOutlined,
    PictureOutlined,
    TableOutlined,
    DeleteOutlined,
    PlusSquareOutlined,
    MinusSquareOutlined,
} from "@ant-design/icons";
import {
    Button,
    Space,
    Dropdown,
    Menu,
    Upload,
    UploadProps,
    message,
} from "antd";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";

interface Props {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

const TiptapEditor: React.FC<Props> = ({
    value,
    onChange,
    placeholder = "Start typing...",
}) => {
    const inputFileRef = useRef<HTMLInputElement | null>(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
            Underline,
            Strike,
            Heading,
            Placeholder.configure({ placeholder }),
            Image,
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "min-h-[150px] border rounded p-3 bg-white prose max-w-none focus:outline-none",
            },
        },
    });

    const headingMenu = (
        <Menu
            items={[
                {
                    key: "h1",
                    label: (
                        <span
                            onClick={() =>
                                editor
                                    ?.chain()
                                    .focus()
                                    .toggleHeading({ level: 1 })
                                    .run()
                            }
                        >
                            H1
                        </span>
                    ),
                },
                {
                    key: "h2",
                    label: (
                        <span
                            onClick={() =>
                                editor
                                    ?.chain()
                                    .focus()
                                    .toggleHeading({ level: 2 })
                                    .run()
                            }
                        >
                            H2
                        </span>
                    ),
                },
                {
                    key: "h3",
                    label: (
                        <span
                            onClick={() =>
                                editor
                                    ?.chain()
                                    .focus()
                                    .toggleHeading({ level: 3 })
                                    .run()
                            }
                        >
                            H3
                        </span>
                    ),
                },
            ]}
        />
    );

    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (!file || !editor) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            editor.chain().focus().setImage({ src: base64 }).run();
        };
        reader.readAsDataURL(file);
    };

    if (!editor) return null;

    return (
        <div>
            <input
                type="file"
                accept="image/*"
                hidden
                ref={inputFileRef}
                onChange={handleImageUpload}
            />
            <Space wrap style={{ marginBottom: 8 }}>
                <Button
                    icon={<BoldOutlined />}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    type={editor.isActive("bold") ? "primary" : "default"}
                />
                <Button
                    icon={<ItalicOutlined />}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    type={editor.isActive("italic") ? "primary" : "default"}
                />
                <Button
                    icon={<UnderlineOutlined />}
                    onClick={() =>
                        editor.chain().focus().toggleUnderline().run()
                    }
                    type={editor.isActive("underline") ? "primary" : "default"}
                />
                <Button
                    icon={<StrikethroughOutlined />}
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    type={editor.isActive("strike") ? "primary" : "default"}
                />
                <Dropdown overlay={headingMenu}>
                    <Button icon={<FontSizeOutlined />} />
                </Dropdown>
                <Button
                    icon={<OrderedListOutlined />}
                    onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                    }
                />
                <Button
                    icon={<UnorderedListOutlined />}
                    onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                />
                <Button
                    icon={<BlockOutlined />}
                    onClick={() =>
                        editor.chain().focus().toggleBlockquote().run()
                    }
                />
                <Button
                    icon={<CodeOutlined />}
                    onClick={() =>
                        editor.chain().focus().toggleCodeBlock().run()
                    }
                />
                <Button
                    icon={<PictureOutlined />}
                    onClick={() => inputFileRef.current?.click()}
                />
                <Button
                    icon={<TableOutlined />}
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .insertTable({
                                rows: 3,
                                cols: 3,
                                withHeaderRow: true,
                            })
                            .run()
                    }
                />
                <Button
                    icon={<PlusSquareOutlined />}
                    onClick={() =>
                        editor.chain().focus().addColumnAfter().run()
                    }
                />
                <Button
                    icon={<MinusSquareOutlined />}
                    onClick={() => editor.chain().focus().deleteColumn().run()}
                />
                <Button
                    icon={<DeleteOutlined />}
                    onClick={() => editor.chain().focus().deleteTable().run()}
                    danger
                />
                <Button
                    icon={<UndoOutlined />}
                    onClick={() => editor.chain().focus().undo().run()}
                />
                <Button
                    icon={<RedoOutlined />}
                    onClick={() => editor.chain().focus().redo().run()}
                />
            </Space>
            <EditorContent editor={editor} />
        </div>
    );
};

export default TiptapEditor;
