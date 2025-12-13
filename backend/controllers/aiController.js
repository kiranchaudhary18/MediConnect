import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const analyzeSymptoms = async (req, res) => {
  try {
    const { symptoms, medicalHistory, age, gender } = req.body;
    
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ message: 'Please provide symptoms' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'AI service is not properly configured' });
    }

    const prompt = `As a medical AI assistant, analyze these symptoms and provide a preliminary assessment. 
    Patient details: ${age} years old ${gender}.
    Symptoms: ${symptoms.join(', ')}.
    Medical history: ${medicalHistory || 'Not provided'}.
    
    Please provide:
    1. Possible conditions (most likely first)
    2. Recommended next steps
    3. When to seek immediate medical attention`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful medical assistant. Provide clear, concise, and accurate information.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const aiResponse = response.data.choices[0].message.content;
    res.json({ analysis: aiResponse });

  } catch (error) {
    console.error('AI Analysis Error:', error.response?.data || error.message);
    res.status(500).json({ 
      message: 'Error processing your request',
      error: error.response?.data?.error?.message || error.message 
    });
  }
};
