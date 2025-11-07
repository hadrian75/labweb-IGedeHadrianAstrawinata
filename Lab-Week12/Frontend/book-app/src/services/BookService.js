import React, { useState, useEffect } from 'react';
import axios from 'axios';


export const API_URL = 'http://localhost:8000/basic/'

export const getAllBooks = async (filters = {}) => {
  try {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== '')
    );

    const response = await axios.get(API_URL, {
      params: cleanFilters
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching books:", error);
    throw error;
  }
};

export const createBook = async (bookData) => {
  try {
    const formData = new FormData();

    formData.append('name', bookData.name);
    formData.append('author', bookData.author);
    formData.append('rating', bookData.rating);

    if (bookData.image) {
      formData.append('image', bookData.image);
    }

    const response = await axios.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error creating book:", error);
    throw error;
  }
};

export const deleteBook = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error deleting book:", error);
    throw error;
  }
};

export const updateBook = async (id, bookData) => {
  try {
    const formData = new FormData();

    formData.append('name', bookData.name);
    formData.append('author', bookData.author);
    formData.append('rating', bookData.rating);

    if (bookData.image instanceof File) {
      formData.append('image', bookData.image);
    }

    const response = await axios.put(`${API_URL}${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error updating book:", error);
    throw error;
  }
};