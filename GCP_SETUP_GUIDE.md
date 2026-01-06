# Google Cloud Platform (GCP) Setup Guide

Since the `gcloud` command is not installed in your current environment, you have two options to deploy your Webcrawler application:

## Option 1: Use Google Cloud Shell (Recommended)

Google Cloud Shell is a free, browser-based development environment that already has `gcloud`, `docker`, and other tools installed.

1.  **Create a GCP Project**:
    *   Go to the [Google Cloud Console](https://console.cloud.google.com/).
    *   Click the project dropdown in the top bar and select **"New Project"**.
    *   Name it (e.g., `webcrawler-app`) and create it.

2.  **Enable APIs**:
    *   In the search bar, type **"Cloud Run API"** and select it -> Click **Enable**.
    *   Search for **"Cloud Build API"** and select it -> Click **Enable**.

3.  **Open Cloud Shell**:
    *   Click the **Activate Cloud Shell** icon (>_) in the top right of the tollbar.
    *   Wait for the terminal to provision.

4.  **Upload Your Code**:
    *   In Cloud Shell, click the **"Open Editor"** button (pencil icon).
    *   Drag and drop your `backend` and `frontend` folders, `deploy_gcp.sh`, and `start.sh` into the file explorer.
    *   *Alternatively*, if this code is on GitHub, verify git is installed (`git --version`) and run:
        ```bash
        git clone <your-repo-url>
        cd <your-repo-name>
        ```

5.  **Deploy**:
    *   In the Cloud Shell terminal, make the script executable:
        ```bash
        chmod +x deploy_gcp.sh
        ```
    *   Run the deployment script:
        ```bash
        ./deploy_gcp.sh
        ```
    *   Follow the prompts to authorize the shell.

---

## Option 2: Install gcloud CLI Locally

If you prefer to deploy from your local machine:

1.  **Install Google Cloud SDK**:
    *   Follow the instructions for your OS here: [Install the gcloud CLI](https://cloud.google.com/sdk/docs/install)

2.  **Initialize**:
    *   Run `gcloud init` to log in and select your project.

3.  **Install Docker**:
    *   Ensure Docker Desktop (or Engine) is installed and running, as the script builds container images locally before uploading.

4.  **Run Deployment**:
    ```bash
    ./deploy_gcp.sh
    ```
