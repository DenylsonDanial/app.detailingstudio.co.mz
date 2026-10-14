import React, { useState } from 'react';
import { Button, Card, CardContent, CardMedia, Typography } from '@mui/material';

interface ImageUploadFieldProps {
    value: File | undefined;
    onChange: (file: File | undefined) => void;
    label: string;
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({ value, onChange, label }) => {
    const [previewUrl, setPreviewUrl] = useState<string | undefined>();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedImage = e.target.files?.[0];
        if (selectedImage) {
            const imageUrl = URL.createObjectURL(selectedImage);
            setPreviewUrl(imageUrl);
            onChange(selectedImage);
        }
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    {label}
                </Typography>
                <input type="file" accept="image/*" onChange={handleImageChange} />
                {previewUrl && <CardMedia component="img" height="200" image={previewUrl} alt="Uploaded Preview" />}
                <Button
                    variant="contained"
                    color="primary"
                    component="label"
                    fullWidth
                >
                    Upload Image
                    <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageChange}
                    />
                </Button>
            </CardContent>
        </Card>
    );
};

export default ImageUploadField;
