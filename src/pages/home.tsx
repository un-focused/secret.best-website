import { VisibilityOff, Visibility } from "@mui/icons-material";
import { Box, Button, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, Paper, Typography } from "@mui/material";
import { useState } from "react";
import axios from '../resources/axiosInstance';
import { encryptFileContents, getFileExtension, getFilename } from "../actions/File";

// TODO: create requests & constants file
// TODO: validate cipher file
// TODO: add validation (password for instance)
// TODO: break down into components
// TODO: add 2MB file check
// TODO: add jumbling logic (mapping)
// TODO: validate jumbling file
// TODO: make id's less predictible
// TODO: generate password if don't want to put one in

export default function Home() {
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [cipherFile, setCipherFile] = useState<File>();
    const [secretFile, setSecretFile] = useState<File>();


    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;

        setPassword(value);
    }

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    }

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    }

    const handleUploadCipherFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const file = event.target.files[0];
        
        setCipherFile(file);
    }

    const handleUploadSecretFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const file = event.target.files[0];

        setSecretFile(file);
    }

    const uploadFile = async (file: File, password: string) => {
        const { cipherText, iv } = await encryptFileContents(file, password);
        const encryptedData = {
            cipherText,
            iv
        };
        const name = getFilename(file);
        const extension = getFileExtension(file);

        const payload = {
            name,
            password,
            extension,
            // we stringify the encrypted data so that we don't need to create a
            // relation on the backend with an inner object that contains the
            // encrypted data, this keeps the process simpler & nicer to work with
            encryptedData: JSON.stringify(encryptedData)
        };

        const { data } = await axios.post('SBFiles', payload);

        return data;
    }

    const handleSubmit = async () => {
        if (!cipherFile || !secretFile) {
            return;
        }

        const results = await Promise.all(
            [
                uploadFile(cipherFile, password),
                uploadFile(secretFile, password),
            ]
        );

        console.log(results);
    }

    return (
        <Box>
            <Paper
                elevation={4}
                sx={
                    {
                        padding: '1em',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }
                }>
                <Typography variant="h4" gutterBottom>
                    Add your secret
                </Typography>
                <Button
                    variant="text"
                    component="label"
                    sx={
                        {
                            width: '80%',
                            margin: 'auto'
                        }
                    }>
                    Upload Secret File
                    <input
                        type="file"
                        onChange={ handleUploadSecretFile }
                        hidden />
                </Button>
                <Typography variant="body1" gutterBottom>
                    No secret file
                </Typography>
                <Button
                    variant="text"
                    component="label"
                    sx={
                        {
                            width: '80%',
                            margin: 'auto'
                        }
                    }>
                    Upload Cipher File
                    <input
                        type="file"
                        onChange={ handleUploadCipherFile }
                        hidden />
                </Button>
                <Typography variant="body1" gutterBottom>
                    No cipher file
                </Typography>
                <FormControl sx={{ m: 1, width: '50ch' }} variant="outlined">
                    <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                    <OutlinedInput
                        id="outlined-adornment-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={handlePasswordChange}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end"
                                >
                                    { showPassword ? <VisibilityOff /> : <Visibility /> }
                                </IconButton>
                            </InputAdornment>
                        }
                        label="Password"
                    />
                </FormControl>
                <Button
                    variant="contained"
                    onClick={ handleSubmit }>
                    Submit
                </Button>
            </Paper>
        </Box>
    );
}