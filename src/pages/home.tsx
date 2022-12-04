import { VisibilityOff, Visibility } from "@mui/icons-material";
import { Box, Button, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, Paper, Typography } from "@mui/material";
import { useState } from "react";
import axios from '../resources/axiosInstance';
import { bufferSourceToString, decryptFileContents, encryptFileContents, getFileExtension, stringToUint8Array } from "../actions/File";

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
            cipherText: new Uint16Array(cipherText),
            iv
        };
        const extension = getFileExtension(file);

        const payload = {
            name: file.name,
            password,
            extension,
            encryptedData
        };

        console.log('cipherText og buff', cipherText);
        console.log('cipherText', new Uint16Array(cipherText));
        console.log('cipherText buff', new Uint16Array(cipherText).buffer);
        console.log('stringed', JSON.stringify(payload.encryptedData));
        const decodedDataA = JSON.parse(JSON.stringify(payload.encryptedData));
        console.log('PARSED JSON', decodedDataA);
        // const originalCT = new Uint16Array(decodedDataA.cipherText);

        // console.log('cipherText AFTER CONVERSION', originalCT);
        // console.log('cipherText AFTER CONVERSION', originalCT.buffer);
        console.log('decodedDataA.cipherText', Object.keys(decodedDataA.cipherText).length);
        const arr = new Array();
        for (const [key, value] of Object.entries(decodedDataA.cipherText)) {
            const index = +key;

            arr[index] = value;
        }

        console.log('arr', arr);
        const f = await decryptFileContents(
            {
                cipherText: new Uint16Array(arr).buffer,
                iv
            }, { name: 'x', extension: 'txt'}, password);
        console.log('file', window.URL.createObjectURL(f));

        // const { data } = await axios.post('SBFiles', payload);

        // return data;
    }

    const handleSubmit = async () => {
        await uploadFile(cipherFile!, 'a');
        // if (!cipherFile || !secretFile) {
        //     return;
        // }

        // const results = await Promise.all(
        //     [
        //         uploadFile(cipherFile, password),
        //         uploadFile(secretFile, password),
        //     ]
        // );

        // console.log(results);
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