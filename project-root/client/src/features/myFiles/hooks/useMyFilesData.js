import { useMemo, useState } from 'react';
import { folderCards, filterChips, myFiles } from '../data/mockMyFilesData';

export function useMyFilesData() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFiles = useMemo(() => {
    return myFiles.filter((file) => {
      const matchesCategory = selectedCategory === 'all' || file.category.toLowerCase() === selectedCategory;
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return {
    folderCards,
    filterChips,
    selectedCategory,
    searchQuery,
    filteredFiles,
    setSelectedCategory,
    setSearchQuery,
  };
}
