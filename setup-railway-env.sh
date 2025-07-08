#!/bin/bash

# Railway Environment Variables Setup Script
# This script helps you set environment variables for your ChatPDF backend on Railway

echo "🚀 Railway ChatPDF Backend - Environment Variables Setup"
echo "========================================================"
echo ""

echo "This script will help you configure environment variables for Railway deployment."
echo "You can either:"
echo "1. Use Railway CLI to set variables (requires Railway CLI installed)"
echo "2. Copy the variables to set manually in Railway dashboard"
echo ""

read -p "Do you have Railway CLI installed? (y/n): " has_cli

if [ "$has_cli" = "y" ] || [ "$has_cli" = "Y" ]; then
    echo ""
    echo "Setting up environment variables using Railway CLI..."
    echo ""
    
    # Set basic variables
    railway variables set ENVIRONMENT=production
    railway variables set DB_NAME=chatpdf_database
    railway variables set JWT_SECRET=your-secret-key-change-in-production-chatpdf-2024
    
    # OpenRouter API Keys
    echo ""
    echo "Setting up OpenRouter API Keys..."
    read -p "Enter your first OpenRouter API key: " openrouter_key1
    if [ ! -z "$openrouter_key1" ]; then
        railway variables set OPENROUTER_API_KEY="$openrouter_key1"
    fi
    
    read -p "Enter your second OpenRouter API key (optional): " openrouter_key2
    if [ ! -z "$openrouter_key2" ]; then
        railway variables set OPENROUTER_API_KEY_2="$openrouter_key2"
    fi
    
    read -p "Enter your third OpenRouter API key (optional): " openrouter_key3
    if [ ! -z "$openrouter_key3" ]; then
        railway variables set OPENROUTER_API_KEY_3="$openrouter_key3"
    fi
    
    read -p "Enter your fourth OpenRouter API key (optional): " openrouter_key4
    if [ ! -z "$openrouter_key4" ]; then
        railway variables set OPENROUTER_API_KEY_4="$openrouter_key4"
    fi
    
    read -p "Enter your fifth OpenRouter API key (optional): " openrouter_key5
    if [ ! -z "$openrouter_key5" ]; then
        railway variables set OPENROUTER_API_KEY_5="$openrouter_key5"
    fi
    
    # Gemini API Keys
    echo ""
    echo "Setting up Gemini API Keys..."
    read -p "Enter your first Gemini API key: " gemini_key1
    if [ ! -z "$gemini_key1" ]; then
        railway variables set GEMINI_API_KEY="$gemini_key1"
    fi
    
    read -p "Enter your second Gemini API key (optional): " gemini_key2
    if [ ! -z "$gemini_key2" ]; then
        railway variables set GEMINI_API_KEY_2="$gemini_key2"
    fi
    
    read -p "Enter your third Gemini API key (optional): " gemini_key3
    if [ ! -z "$gemini_key3" ]; then
        railway variables set GEMINI_API_KEY_3="$gemini_key3"
    fi
    
    read -p "Enter your fourth Gemini API key (optional): " gemini_key4
    if [ ! -z "$gemini_key4" ]; then
        railway variables set GEMINI_API_KEY_4="$gemini_key4"
    fi
    
    echo ""
    echo "✅ Environment variables have been set!"
    echo "🔄 Railway will automatically redeploy your application with the new variables."
    
else
    echo ""
    echo "📋 Copy these environment variables to your Railway dashboard:"
    echo "================================================================"
    echo ""
    echo "ENVIRONMENT=production"
    echo "DB_NAME=chatpdf_database"
    echo "JWT_SECRET=your-secret-key-change-in-production-chatpdf-2024"
    echo ""
    echo "# OpenRouter API Keys (replace with your actual keys):"
    echo "OPENROUTER_API_KEY=sk-or-v1-your-first-key"
    echo "OPENROUTER_API_KEY_2=sk-or-v1-your-second-key"
    echo "OPENROUTER_API_KEY_3=sk-or-v1-your-third-key"
    echo "OPENROUTER_API_KEY_4=sk-or-v1-your-fourth-key"
    echo "OPENROUTER_API_KEY_5=sk-or-v1-your-fifth-key"
    echo ""
    echo "# Gemini API Keys (replace with your actual keys):"
    echo "GEMINI_API_KEY=AIza-your-first-gemini-key"
    echo "GEMINI_API_KEY_2=AIza-your-second-gemini-key"
    echo "GEMINI_API_KEY_3=AIza-your-third-gemini-key"
    echo "GEMINI_API_KEY_4=AIza-your-fourth-gemini-key"
    echo ""
    echo "📝 To set these in Railway dashboard:"
    echo "1. Go to your project in Railway dashboard"
    echo "2. Click on your service"
    echo "3. Go to 'Variables' tab"
    echo "4. Add each variable individually"
    echo ""
fi

echo ""
echo "⚠️  Important Notes:"
echo "- MONGO_URL will be automatically set when you add MongoDB service"
echo "- Replace JWT_SECRET with a strong, unique secret key"
echo "- You can add more API keys later for better load balancing"
echo ""
echo "🔗 Useful Railway Commands:"
echo "railway logs     # View application logs"
echo "railway status   # Check deployment status"
echo "railway domain   # Get your application URL"
echo ""
echo "🎉 Your ChatPDF backend should be ready for Railway deployment!"