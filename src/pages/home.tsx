import { VisibilityOff, Visibility } from "@mui/icons-material";
import { Box, Button, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, Paper, Typography } from "@mui/material";
import { useState } from "react";
import axios from '../resources/axiosInstance';
import { decryptFileContents, encryptFileContents, getFileExtension } from "../actions/File";

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
        const result = await encryptFileContents(file, password);
        console.log('URL BEFORE', window.URL.createObjectURL(file));
        const encryptedData = JSON.stringify(result);
        const extension = getFileExtension(file);
        const dF = await decryptFileContents(result, {extension: '', name: ''}, password);

        // new TextDecoder().decode(cipherText)

        console.log('RESULT', JSON.stringify(result));
        console.log('DECRYPT', dF);

        const url = window.URL.createObjectURL(dF);
        console.log(url);
        const payload = {
            name: file.name,
            password,
            extension,
            encryptedData
        };

        // return axios.post(
        //     'SBFiles',
        //     payload
        // );
    }

    const handleSubmit = async () => {
        if (!cipherFile || !secretFile) {
            return;
        }

        const data = await Promise.all(
            [
                uploadFile(cipherFile, password),
                uploadFile(secretFile, password),
            ]
        );

        console.log(data);
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