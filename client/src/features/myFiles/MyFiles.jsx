import FolderCard from './components/FolderCard';
import FileCard from './components/FileCard';
import FilterChips from './components/FilterChips';
import SearchBar from './components/SearchBar';
import { useMyFilesData } from './hooks/useMyFilesData';

export default function MyFiles() {
  const {
    folderCards,
    filterChips,
    selectedCategory,
    searchQuery,
    filteredFiles,
    setSelectedCategory,
    setSearchQuery,
  } = useMyFilesData();

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-8 rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm shadow-slate-100">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#4F46E5]">My Files</p>
            <h1 className="mt-2 text-3xl font-semibold text-[#0F172A]">Secure files and folder details</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#64748B]">
              Manage shared reports, design assets, legal documents, and analytics files with quick search and tags.
            </p>
          </div>
          <div className="grid gap-3 sm:w-[320px]">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
        </div>
      </header>

      <section className="mb-8 space-y-6">
        <div className="grid gap-4 xl:grid-cols-3">
          {folderCards.map((folder) => (
            <FolderCard key={folder.id} {...folder} />
          ))}
        </div>
      </section>

      <section className="mb-6 rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm shadow-slate-100">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#0F172A]">All files</h2>
            <p className="mt-1 text-sm text-[#64748B]">Browse the latest project files and secure documents.</p>
          </div>
          <FilterChips chips={filterChips} activeId={selectedCategory} onChange={setSelectedCategory} />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredFiles.map((file) => (
          <FileCard key={file.id} file={file} />
        ))}
      </section>
    </div>
  );
}
