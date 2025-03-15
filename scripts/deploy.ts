import { exec } from 'child_process';

const deployApplication = () => {
    console.log('Starting deployment process...');

    exec('npm run build', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error during build: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Build stderr: ${stderr}`);
            return;
        }
        console.log(`Build output: ${stdout}`);

        exec('npm run start', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error during deployment: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Deployment stderr: ${stderr}`);
                return;
            }
            console.log(`Deployment output: ${stdout}`);
            console.log('Deployment completed successfully.');
        });
    });
};

deployApplication();