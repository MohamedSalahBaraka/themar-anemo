// resources/js/Pages/Admin/Reviews/Edit.jsx

import { Form, Input, Button, Rate, Switch, message, Space } from "antd";
import AdminLayout from "@/Layouts/AdminLayout";
import { Link, useForm } from "@inertiajs/react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Review {
    id: number;
    rating: number;
    review: string;
    is_public: boolean;
    user_service?: {
        service?: {
            name?: string;
        };
        user?: {
            name?: string;
        };
    };
}

interface ReviewEditProps {
    review: Review;
}
const ReviewEdit: React.FC<ReviewEditProps> = ({ review }) => (
    <AdminLayout>
        <Page review={review} />
    </AdminLayout>
);
const Page: React.FC<ReviewEditProps> = ({ review }) => {
    const { data, setData, put, processing, errors } = useForm({
        rating: review.rating,
        review: review.review,
        is_public: review.is_public,
    });

    const { t } = useLanguage();
    const handleSubmit = () => {
        put(route("admin.reviews.update", review.id), {
            preserveScroll: true,
            onSuccess: () => message.success(t("Review updated successfully")),
        });
    };

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <h1>{t("Edit Review")}</h1>
                <p>
                    {t("Service")}: {review.user_service?.service?.name}
                </p>
                <p>
                    {t("User")}: {review.user_service?.user?.name}
                </p>
            </div>

            <Form layout="vertical" onFinish={handleSubmit}>
                <Form.Item
                    label={t("Rating")}
                    validateStatus={errors.rating ? "error" : ""}
                    help={errors.rating}
                >
                    <Rate
                        value={data.rating}
                        onChange={(value) => setData("rating", value)}
                    />
                </Form.Item>

                <Form.Item
                    label={t("Review")}
                    validateStatus={errors.review ? "error" : ""}
                    help={errors.review}
                >
                    <Input.TextArea
                        rows={4}
                        value={data.review}
                        onChange={(e) => setData("review", e.target.value)}
                    />
                </Form.Item>

                <Form.Item
                    label={t("Public")}
                    validateStatus={errors.is_public ? "error" : ""}
                    help={errors.is_public}
                >
                    <Switch
                        checked={data.is_public}
                        onChange={(checked) => setData("is_public", checked)}
                    />
                </Form.Item>

                <Form.Item>
                    <Space>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={processing}
                        >
                            {t("Save Changes")}
                        </Button>
                        <Link href={route("admin.reviews.index")}>
                            <Button>{t("Cancel")}</Button>
                        </Link>
                    </Space>
                </Form.Item>
            </Form>
        </div>
    );
};

export default ReviewEdit;
