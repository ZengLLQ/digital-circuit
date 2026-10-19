import { X, BookOpen } from "lucide-react";

interface EducationalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EducationalModal: React.FC<EducationalModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-[#121316] border border-[#252732] rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#202228] flex items-center justify-between bg-[#15161a]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#7c3aed]/20 border border-[#7c3aed]/30 flex items-center justify-center text-[#c4b5fd]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#f3f4f6]">
                Karnaugh Map Educational Guide
              </h2>
              <p className="text-xs text-[#8c919e] mt-0.5">
                Core mathematical principles of Boolean simplification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9ca3af] hover:text-[#f3f4f6] hover:bg-[#20222a] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-[#d1d5db] leading-relaxed">
          {/* Rule 1 */}
          <div className="p-4 rounded-xl bg-[#18191e] border border-[#252732]">
            <h3 className="text-sm font-semibold text-[#ffffff] mb-1.5 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#7c3aed] text-white flex items-center justify-center text-[10px] font-bold">1</span>
              Gray Code & Adjacency
            </h3>
            <p>
              Row and column headers are ordered in reflected binary Gray code (<code className="bg-[#131417] text-[#e4e4e7] px-1 py-0.5 rounded border border-[#252732]">00, 01, 11, 10</code>). Adjacent cells differ by exactly <b>one variable</b>. This allows algebraic combining via the consensus identity:
              <br />
              <code className="text-[#a78bfa] font-bold mt-1 inline-block">AB + AB′ = A(B + B′) = A(1) = A</code>
            </p>
          </div>

          {/* Rule 2 */}
          <div className="p-4 rounded-xl bg-[#18191e] border border-[#252732]">
            <h3 className="text-sm font-semibold text-[#ffffff] mb-1.5 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#7c3aed] text-white flex items-center justify-center text-[10px] font-bold">2</span>
              Group Sizing (Powers of Two)
            </h3>
            <p>
              Valid groups must contain <b>1, 2, 4, 8, or 16</b> cells. Each doubling of group size eliminates an additional literal:
            </p>
            <ul className="mt-2 space-y-1 pl-4 list-disc text-[#cbd0dc]">
              <li><b>1 cell:</b> 0 variables eliminated (full minterm)</li>
              <li><b>2 cells:</b> 1 variable eliminated</li>
              <li><b>4 cells:</b> 2 variables eliminated</li>
              <li><b>8 cells:</b> 3 variables eliminated</li>
              <li><b>16 cells:</b> all variables eliminated (Constant 1 or 0)</li>
            </ul>
          </div>

          {/* Rule 3 */}
          <div className="p-4 rounded-xl bg-[#18191e] border border-[#252732]">
            <h3 className="text-sm font-semibold text-[#ffffff] mb-1.5 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#7c3aed] text-white flex items-center justify-center text-[10px] font-bold">3</span>
              Toroidal Wraparound Geometry
            </h3>
            <p>
              A Karnaugh map is topologically a <b>torus</b> (donut). The leftmost column is adjacent to the rightmost column (differing only in one bit), and the top row is adjacent to the bottom row.
              <br />
              In a 4-variable map, the <b>four outer corners</b> (m0, m2, m8, m10) form a valid, highly efficient 4-cell group simplifying to <code className="bg-[#131417] text-[#a78bfa] font-bold px-1 py-0.5 rounded border border-[#252732]">B′D′</code>!
            </p>
          </div>

          {/* Rule 4 */}
          <div className="p-4 rounded-xl bg-[#18191e] border border-[#252732]">
            <h3 className="text-sm font-semibold text-[#ffffff] mb-1.5 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#7c3aed] text-white flex items-center justify-center text-[10px] font-bold">4</span>
              SoP vs PoS Dual Formulation
            </h3>
            <p>
              <b>Sum of Products (SoP):</b> Groups of <code className="bg-[#131417] text-[#e4e4e7] px-1 py-0.5 rounded border border-[#252732]">1</code>s formed as product terms joined by <b>OR (+)</b>.
              <br />
              <b>Product of Sums (PoS):</b> Groups of <code className="bg-[#131417] text-[#e4e4e7] px-1 py-0.5 rounded border border-[#252732]">0</code>s formed as sum terms joined by <b>AND</b>. Note that in a PoS sum term, an input bit <code>0</code> yields uncomplemented variable (e.g. <code>A</code>) and bit <code>1</code> yields complemented (<code>A′</code>).
            </p>
          </div>

          {/* Rule 5 */}
          <div className="p-4 rounded-xl bg-[#18191e] border border-[#252732]">
            <h3 className="text-sm font-semibold text-[#ffffff] mb-1.5 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#7c3aed] text-white flex items-center justify-center text-[10px] font-bold">5</span>
              Don't-Care Terms (X)
            </h3>
            <p>
              Don't-care conditions can be included in groups if they help enlarge a group (e.g. from 2 to 4 cells), thereby reducing literals. However, an implicant is never created solely to cover don't-care cells.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#202228] flex justify-end bg-[#15161a]">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#7c3aed] hover:bg-[#6d28d9] text-white shadow-md transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
