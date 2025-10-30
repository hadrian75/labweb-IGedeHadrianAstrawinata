import React, { useState, useEffect } from 'react';
import axios from 'axios';


export const API_URL = 'http://localhost:8000/basic/'

export const getAllBooks = async (filters = {}) => {
  try {
    const response = await axios.get(API_URL, { params: filters });
    return response.data;
  } catch (error) {
    console.error("Error fetching books:", error);
    throw error;
  }
}

export const createBook = async (book) => {
  try {
    const response = await axios.post(API_URL, book);
    return response.data;
  } catch (error) {
    console.error("Error creating book:", error);
    throw error;
  }
}

export const deleteBook = async (id) => {
  try {
    await axios.delete(`${API_URL}${id}/`);
  } catch (error) {
    console.error("Error deleting book:", error);
    throw error;
  }
}

export const updateBook = async (id, updatedBook) => {
  try {
    const response = await axios.put(`${API_URL}${id}/`, updatedBook);
    return response.data;
  } catch (error) {
    console.error("Error updating book:", error);
    throw error;
  }
}