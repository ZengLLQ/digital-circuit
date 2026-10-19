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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-950/80 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Karnaugh Map Educational Guide
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Core mathematical principles of Boolean simplification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {/* Rule 1 */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
              Gray Code & Adjacency
            </h3>
            <p>
              Row and column headers are ordered in reflected binary Gray code (<code>00, 01, 11, 10</code>). Adjacent cells differ by exactly <b>one variable</b>. This allows algebraic combining via the consensus identity:
              <br />
              <code className="text-cyan-600 dark:text-cyan-400 font-bold">AB + AB′ = A(B + B′) = A(1) = A</code>
            </p>
          </div>

          {/* Rule 2 */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
              Group Sizing (Powers of Two)
            </h3>
            <p>
              Valid groups must contain <b>1, 2, 4, 8, or 16</b> cells. Each doubling of group size eliminates an additional literal:
            </p>
            <ul className="mt-2 space-y-1 pl-4 list-disc text-slate-500 dark:text-slate-400">
              <li><b>1 cell:</b> 0 variables eliminated (full minterm)</li>
              <li><b>2 cells:</b> 1 variable eliminated</li>
              <li><b>4 cells:</b> 2 variables eliminated</li>
              <li><b>8 cells:</b> 3 variables eliminated</li>
              <li><b>16 cells:</b> all variables eliminated (Constant 1 or 0)</li>
            </ul>
          </div>

          {/* Rule 3 */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[10px] font-bold">3</span>
              Toroidal Wraparound Geometry
            </h3>
            <p>
              A Karnaugh map is topologically a <b>torus</b> (donut). The leftmost column is adjacent to the rightmost column (differing only in one bit), and the top row is adjacent to the bottom row.
              <br />
              In a 4-variable map, the <b>four outer corners</b> (m0, m2, m8, m10) form a valid, highly efficient 4-cell group simplifying to <code>B′D′</code>!
            </p>
          </div>

          {/* Rule 4 */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[10px] font-bold">4</span>
              SoP vs PoS Dual Formulation
            </h3>
            <p>
              <b>Sum of Products (SoP):</b> Groups of <code>1</code>s formed as product terms joined by <code>OR (+)</code>.
              <br />
              <b>Product of Sums (PoS):</b> Groups of <code>0</code>s formed as sum terms joined by <code>AND</code>. Note that in a PoS sum term, an input bit <code>0</code> yields uncomplemented variable (e.g. <code>A</code>) and bit <code>1</code> yields complemented (<code>A′</code>).
            </p>
          </div>

          {/* Rule 5 */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[10px] font-bold">5</span>
              Don't-Care Terms (X)
            </h3>
            <p>
              Don't-care conditions can be included in groups if they help enlarge a group (e.g. from 2 to 4 cells), thereby reducing literals. However, an implicant is never created solely to cover don't-care cells.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-850/50">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
