'use client'

import { useState } from 'react'
import { FileText, Sparkles, Save, Plus, Copy, Trash2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Template {
    id: string
    name: string
    content: string
    prompt?: string
    createdAt: string
}

export default function ProposalManager({ initialTemplates }: { initialTemplates: Template[] }) {
    const router = useRouter()
    const [templates, setTemplates] = useState<Template[]>(initialTemplates)
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
    const [prompt, setPrompt] = useState('')
    const [generatedContent, setGeneratedContent] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [templateName, setTemplateName] = useState('')
    const [view, setView] = useState<'list' | 'create'>('list')

    const handleGenerate = async () => {
        if (!prompt) return toast.error('Please enter a prompt')

        setIsGenerating(true)
        try {
            const res = await fetch('/api/proposals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'generate', prompt })
            })

            if (!res.ok) throw new Error('Generation failed')

            const data = await res.json()
            setGeneratedContent(data.content)
            toast.success('Proposal generated!')
        } catch (error) {
            toast.error('Failed to generate proposal')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleSave = async () => {
        if (!templateName) return toast.error('Please name your template')
        if (!generatedContent) return toast.error('No content to save')

        setIsSaving(true)
        try {
            const res = await fetch('/api/proposals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'save',
                    name: templateName,
                    content: generatedContent,
                    prompt
                })
            })

            if (!res.ok) throw new Error('Save failed')

            const newTemplate = await res.json()
            setTemplates([newTemplate, ...templates])
            setSelectedTemplate(newTemplate)
            setView('list')
            toast.success('Template saved!')
            router.refresh()
        } catch (error) {
            toast.error('Failed to save template')
        } finally {
            setIsSaving(false)
        }
    }

    const handleCopy = (content: string) => {
        navigator.clipboard.writeText(content)
        toast.success('Copied to clipboard')
    }

    return (
        <div className="flex h-[calc(100vh-8rem)] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {/* Sidebar List */}
            <div className="w-1/3 border-r border-slate-800 bg-slate-900/50 flex flex-col">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white">Templates</h2>
                    <button
                        onClick={() => {
                            setView('create')
                            setGeneratedContent('')
                            setPrompt('')
                            setTemplateName('')
                            setSelectedTemplate(null)
                        }}
                        className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {templates.map(t => (
                        <button
                            key={t.id}
                            onClick={() => {
                                setSelectedTemplate(t)
                                setGeneratedContent(t.content)
                                setView('create') // Show editor mode when selected
                            }}
                            className={`w-full text-left p-4 rounded-xl transition-all border ${selectedTemplate?.id === t.id ? 'bg-blue-600/10 border-blue-500/50' : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'}`}
                        >
                            <div className="flex items-center gap-3 mb-1">
                                <FileText className="w-4 h-4 text-blue-400" />
                                <span className="font-medium text-white truncate">{t.name}</span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2">{t.content.substring(0, 60)}...</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Editing Area */}
            <div className="flex-1 flex flex-col bg-slate-950">
                {view === 'create' ? (
                    <>
                        <div className="p-6 border-b border-slate-800 bg-slate-900">
                            <div className="flex gap-4 mb-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-slate-400 mb-1 ml-1 uppercase tracking-wider">Proposal Generator Prompt</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={prompt}
                                            onChange={e => setPrompt(e.target.value)}
                                            placeholder="e.g. Write a proposal for a Website Redesign for a Lawyer..."
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pr-12 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                        <button
                                            onClick={handleGenerate}
                                            disabled={isGenerating}
                                            className="absolute right-2 top-1.5 p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {isGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                        <Sparkles className="w-3 h-3 text-yellow-500" />
                                        AI-Powered Generation
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 p-6 overflow-hidden flex flex-col">
                            <div className="flex items-center justify-between mb-2">
                                <input
                                    type="text"
                                    value={templateName}
                                    onChange={e => setTemplateName(e.target.value)}
                                    placeholder="Template Name..."
                                    className="bg-transparent text-xl font-bold text-white focus:outline-none placeholder:text-slate-600"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleCopy(generatedContent)}
                                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                        title="Copy to Clipboard"
                                    >
                                        <Copy className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" />
                                        Save Template
                                    </button>
                                </div>
                            </div>
                            <textarea
                                value={generatedContent}
                                onChange={e => setGeneratedContent(e.target.value)}
                                className="flex-1 w-full bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-300 focus:outline-none focus:border-slate-700 resize-none font-mono text-sm leading-relaxed"
                                placeholder="Generated proposal content will appear here..."
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <FileText className="w-16 h-16 mb-4 opacity-20" />
                        <p>Select a template or create a new one</p>
                    </div>
                )}
            </div>
        </div>
    )
}
