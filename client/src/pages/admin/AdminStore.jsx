/*
 * Lumina - Admin Store Management
 * Soft Bloom Design: Goods approval queue
 */

import { useState } from 'react';
import Layout from '@/components/Layout';
import { Package, Check, X, Eye, Clock } from 'lucide-react';
import { goodsItems, formatPrice } from '@/lib/data';
import { toast } from 'sonner';

const pendingGoods = [
{ id: 201, name: 'NOVA 공식 포토카드 세트 (한정판)', artistName: 'NOVA', price: 35000, image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', category: 'official', submittedDate: '2026-02-18', description: '공식 포토카드 12종 세트', stock: 500 },
{ id: 202, name: '이하은 팬메이드 아크릴 키링', artistName: '이하은', price: 8500, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&h=400&fit=crop', category: 'unofficial', submittedDate: '2026-02-17', description: '팬이 직접 제작한 아크릴 키링', stock: 50 },
{ id: 203, name: 'BLOSSOM 공식 응원봉', artistName: 'BLOSSOM', price: 45000, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', category: 'official', submittedDate: '2026-02-16', description: '공식 응원봉 2세대', stock: 1000 },
{ id: 204, name: '김지수 팬아트 포스터', artistName: '김지수', price: 12000, image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop', category: 'unofficial', submittedDate: '2026-02-15', description: '팬아트 A3 포스터', stock: 30 },
{ id: 205, name: 'NOVA 공식 후드티', artistName: 'NOVA', price: 89000, image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&h=400&fit=crop', category: 'official', submittedDate: '2026-02-14', description: '공식 후드티 S/M/L/XL', stock: 200 }];


const categoryLabel = {
  official: { label: '공식 굿즈', class: 'badge-rose' },
  unofficial: { label: '팬메이드', class: 'badge-lavender' },
  used: { label: '중고거래', class: 'bg-gray-100 text-gray-600' }
};

export default function AdminStore() {
  const [activeTab, setActiveTab] = useState('pending');
  const [approvedIds, setApprovedIds] = useState([]);
  const [rejectedIds, setRejectedIds] = useState([]);

  const handleApprove = (id, name) => {
    setApprovedIds([...approvedIds, id]);
    toast.success(`"${name}" 굿즈가 승인되었습니다`);
  };

  const handleReject = (id, name) => {
    setRejectedIds([...rejectedIds, id]);
    toast.warning(`"${name}" 굿즈가 거절되었습니다`);
  };

  const pendingList = pendingGoods.filter((g) => !approvedIds.includes(g.id) && !rejectedIds.includes(g.id));

  return (
    <Layout role="admin">
      <div className="p-4 lg:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
            굿즈 승인 관리
          </h1>
          <p className="text-sm text-muted-foreground">등록 요청된 굿즈를 검토하고 승인합니다</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card rounded-2xl p-4 text-center soft-shadow">
            <p className="text-xl font-bold text-amber-600" style={{ fontFamily: "'DM Sans', sans-serif" }}>{pendingList.length}</p>
            <p className="text-xs text-muted-foreground">승인 대기</p>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center soft-shadow">
            <p className="text-xl font-bold text-teal-600" style={{ fontFamily: "'DM Sans', sans-serif" }}>{approvedIds.length}</p>
            <p className="text-xs text-muted-foreground">승인 완료</p>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center soft-shadow">
            <p className="text-xl font-bold text-red-600" style={{ fontFamily: "'DM Sans', sans-serif" }}>{rejectedIds.length}</p>
            <p className="text-xs text-muted-foreground">거절</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-amber-50 p-1 rounded-2xl">
          {[
          { key: 'pending', label: `대기 중 (${pendingList.length})` },
          { key: 'approved', label: '등록 굿즈' }].
          map((tab) =>
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === tab.key ?
            'bg-white text-amber-600 shadow-sm' :
            'text-muted-foreground hover:text-foreground'}`
            }>
            
              {tab.label}
            </button>
          )}
        </div>

        {activeTab === 'pending' &&
        <div className="space-y-4">
            {pendingList.length === 0 ?
          <div className="text-center py-16">
                <Package size={48} className="text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">처리할 굿즈가 없습니다</p>
              </div> :

          pendingList.map((item) =>
          <div key={item.id} className="glass-card rounded-2xl overflow-hidden soft-shadow">
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative sm:w-40 h-36 sm:h-auto flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${categoryLabel[item.category].class}`}>
                          {categoryLabel[item.category].label}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-foreground">{item.name}</h3>
                          <p className="text-sm text-rose-500 font-medium">{item.artistName}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                          <Clock size={11} />
                          {item.submittedDate}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                      <div className="flex items-center gap-4 mb-3">
                        <span className="text-lg font-bold text-foreground">{formatPrice(item.price)}</span>
                        <span className="text-xs text-muted-foreground">재고 {item.stock}개</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                    onClick={() => handleApprove(item.id, item.name)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-xl bg-teal-500 hover:bg-teal-600 transition-colors">
                    
                          <Check size={16} />
                          승인
                        </button>
                        <button
                    onClick={() => handleReject(item.id, item.name)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-red-600 rounded-xl bg-red-50 hover:bg-red-100 transition-colors">
                    
                          <X size={16} />
                          거절
                        </button>
                        <button
                    onClick={() => toast.info('상세 검토 기능 준비 중입니다')}
                    className="px-4 py-2.5 text-sm font-semibold text-muted-foreground rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    
                          <Eye size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
          )
          }
          </div>
        }

        {activeTab === 'approved' &&
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {goodsItems.map((item) =>
          <div key={item.id} className="glass-card rounded-2xl overflow-hidden soft-shadow">
                <div className="relative">
                  <img src={item.image} alt={item.name} className="w-full h-36 object-cover" />
                  <div className="absolute top-2 right-2 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs text-rose-500 font-semibold">{item.artistName}</p>
                  <p className="font-semibold text-sm text-foreground line-clamp-1 mt-0.5">{item.name}</p>
                  <p className="text-sm font-bold text-foreground mt-1">{formatPrice(item.price)}</p>
                </div>
              </div>
          )}
          </div>
        }
      </div>
    </Layout>);

}