// resources/js/Pages/Admin/Reviews/Edit.jsx

import { Form, Input, Button, Rate, Switch, message, Space } from "antd";
import AdminLayout from "@/Layouts/AdminLayout";
import { Link, useForm } from "@inertiajs/react";

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

const ReviewEdit: React.FC<ReviewEditProps> = ({ review }) => {
    const { data, setData, put, processing, errors } = useForm({
        rating: review.rating,
        review: review.review,
        is_public: review.is_public,
    });

    const handleSubmit = () => {
        put(route("admin.reviews.update", review.id), {
            preserveScroll: true,
            onSuccess: () => message.success("Review updated successfully"),
        });
    };

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <h1>Edit Review</h1>
                <p>Service: {review.user_service?.service?.name}</p>
                <p>User: {review.user_service?.user?.name}</p>
            </div>

            <Form layout="vertical" onFinish={handleSubmit}>
                <Form.Item
                    label="Rating"
                    validateStatus={errors.rating ? "error" : ""}
                    help={errors.rating}
                >
                    <Rate
                        value={data.rating}
                        onChange={(value) => setData("rating", value)}
                    />
                </Form.Item>

                <Form.Item
                    label="Review"
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
                    label="Public"
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
                            Save Changes
                        </Button>
                        <Link href={route("admin.reviews.index")}>
                            <Button>Cancel</Button>
                        </Link>
                    </Space>
                </Form.Item>
            </Form>
        </div>
    );
};

export default ReviewEdit;
