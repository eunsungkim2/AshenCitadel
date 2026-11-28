using System;
using System.Drawing;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

internal static class Program
{
    internal const string GameUrl = "https://ashen-citadel.local/index.html";
    private static readonly Assembly Package = typeof(Program).Assembly;

    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern IntPtr LoadLibrary(string path);

    [STAThread]
    private static int Main(string[] args)
    {
        string report = args.Length == 2 && args[0] == "--smoke-test" ? args[1] : null;
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);

        try
        {
            string data = report == null
                ? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "AshenCitadel")
                : Path.Combine(Path.GetTempPath(), "AshenCitadel-test-" + Guid.NewGuid().ToString("N"));
            string assets = Path.Combine(data, "assets", Package.ManifestModule.ModuleVersionId.ToString("N"));
            string loader = Extract(assets, "WebView2Loader.dll");
            if (LoadLibrary(loader) == IntPtr.Zero)
                throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error());

            foreach (string asset in new[] { "index.html", "style.css", "game.js", "assets/demon-sprites.js", "LICENSE.txt", "NOTICE.txt" })
                Extract(assets, asset);

            AppDomain.CurrentDomain.AssemblyResolve += ResolveAssembly;
            return RunGame(data, assets, report);
        }
        catch (Exception error)
        {
            ReportError(error, report);
            return 1;
        }
    }

    private static Assembly ResolveAssembly(object sender, ResolveEventArgs args)
    {
        string name = new AssemblyName(args.Name).Name;
        if (name != "Microsoft.Web.WebView2.Core" && name != "Microsoft.Web.WebView2.WinForms")
            return null;
        return Assembly.Load(ReadResource(name + ".dll"));
    }

    private static byte[] ReadResource(string name)
    {
        using (Stream resource = Package.GetManifestResourceStream(name))
        using (var buffer = new MemoryStream())
        {
            resource.CopyTo(buffer);
            return buffer.ToArray();
        }
    }

    private static string Extract(string directory, string name)
    {
        string destination = Path.Combine(directory, name.Replace('/', Path.DirectorySeparatorChar));
        Directory.CreateDirectory(Path.GetDirectoryName(destination));
        if (File.Exists(destination))
            return destination;

        string temporary = destination + "." + Guid.NewGuid().ToString("N");
        try
        {
            File.WriteAllBytes(temporary, ReadResource(name));
            try { File.Move(temporary, destination); }
            catch (IOException) { if (!File.Exists(destination)) throw; }
        }
        finally
        {
            File.Delete(temporary);
        }
        return destination;
    }

    [System.Runtime.CompilerServices.MethodImpl(System.Runtime.CompilerServices.MethodImplOptions.NoInlining)]
    private static int RunGame(string data, string assets, string report)
    {
        using (var window = new GameWindow(data, assets, report))
        {
            Application.Run(window);
            return window.ExitCode;
        }
    }

    internal static void ReportError(Exception error, string report)
    {
        if (report != null)
            File.WriteAllText(report, error.ToString());
        else
            MessageBox.Show("게임을 시작하지 못했습니다. Microsoft Edge WebView2 런타임이 설치되어 있는지 확인하세요.\n\n" + error.Message,
                "잿빛성체", MessageBoxButtons.OK, MessageBoxIcon.Error);
    }
}

internal sealed class GameWindow : Form
{
    private readonly WebView2 view = new WebView2();
    private readonly string data;
    private readonly string assets;
    private readonly string report;
    internal int ExitCode { get; private set; }

    internal GameWindow(string data, string assets, string report)
    {
        this.data = data;
        this.assets = assets;
        this.report = report;
        Text = "잿빛성체";
        StartPosition = FormStartPosition.CenterScreen;
        var available = Screen.PrimaryScreen.WorkingArea;
        Size = new Size(Math.Min(1440, available.Width), Math.Min(980, available.Height));
        MinimumSize = new Size(420, 350);
        BackColor = Color.FromArgb(17, 15, 19);
        view.DefaultBackgroundColor = BackColor;
        view.Dock = DockStyle.Fill;
        Controls.Add(view);
        Shown += async (sender, args) => await Initialize();
    }

    private async Task Initialize()
    {
        try
        {
            var environment = await CoreWebView2Environment.CreateAsync(null, Path.Combine(data, "profile"));
            if (IsDisposed) return;
            await view.EnsureCoreWebView2Async(environment);
            if (IsDisposed) return;
            var browser = view.CoreWebView2;
            browser.SetVirtualHostNameToFolderMapping("ashen-citadel.local", assets, CoreWebView2HostResourceAccessKind.Deny);
            browser.Settings.AreDevToolsEnabled = false;
            browser.Settings.AreDefaultContextMenusEnabled = false;
            browser.Settings.IsStatusBarEnabled = false;
            browser.Settings.IsZoomControlEnabled = false;
            browser.NavigationStarting += (sender, args) => args.Cancel = args.Uri != Program.GameUrl;
            browser.NewWindowRequested += (sender, args) => args.Handled = true;
            browser.NavigationCompleted += async (sender, args) =>
            {
                try
                {
                    if (!args.IsSuccess) throw new InvalidOperationException("게임 로드 오류: " + args.WebErrorStatus);
                    if (report != null) await SmokeTest();
                }
                catch (Exception error) { Fail(error); }
            };
            browser.Navigate(Program.GameUrl);
        }
        catch (Exception error) { if (!IsDisposed) Fail(error); }
    }

    private async Task SmokeTest()
    {
        await Task.Delay(350);
        using (var title = File.Create(Path.ChangeExtension(report, ".title.png")))
            await view.CoreWebView2.CapturePreviewAsync(CoreWebView2CapturePreviewImageFormat.Png, title);
        string sales = await view.ExecuteScriptAsync(@"(() => {
            const home=document.getElementById('home').getBoundingClientRect();
            const art=document.getElementById('titleArt').getBoundingClientRect();
            const menu=document.querySelector('.home-card').getBoundingClientRect();
            if(document.title!=='잿빛성체' || document.querySelector('.home-card h1').textContent!==document.title ||
                Math.abs(home.width-art.width)>1 || Math.abs(home.height-art.height)>1 ||
                Math.abs(menu.left+menu.width/2-(home.left+home.width/2))>1) return 'full-screen title layout';
            document.getElementById('homeCodex').click();
            if (!document.querySelector('#dialogBody #codexContent')) return 'title codex';
            closeDialog();
            if (!document.querySelector('#codexAnchor #codexContent')) return 'battle codex';
            if (document.getElementById('home').hidden || !document.getElementById('gameScreen').hidden) return 'title screen';
            if(document.querySelectorAll('.gem-orbit i').length!==7 || getComputedStyle(document.querySelector('.gem-orbit')).animationName!=='gem-orbit')
                return 'seven rotating gems';
            document.getElementById('options').click();
            if (!document.getElementById('dialog').open) return 'options';
            closeDialog();
            document.getElementById('homeLegacy').click();
            if (document.getElementById('dialogTitle').textContent !== '계승 연구' ||
                document.querySelectorAll('.research-branch').length !== 5) return 'title research';
            closeDialog();
            document.getElementById('play').click();
            if (!document.getElementById('home').hidden || document.getElementById('gameScreen').hidden) return 'start game';
            if (wavePlan(3).entries.every(x=>x.type!=='swift') || wavePlan(6).entries.every(x=>x.type!=='tank')
                || wavePlan(13).entries.every(x=>x.type!=='swarm')) return 'enemy variety';
            const advance = name=>[...document.getElementById('dialogBody').querySelectorAll('button')]
                .find(button=>button.textContent===name)?.click();
            const claimReward=()=>{
                const cards=[...document.querySelectorAll('.relic-choices button')];
                if (cards.length!==3 || !cards.every(card=>card.querySelector('.reward-grade'))) return false;
                cards[0].click();return true;
            };
            const originalRandom=Math.random;
            Math.random=()=>0;
            game.round=50; game.bossDefeated=true; completeWave();
            if(game.phase!=='relic' || !document.querySelector('.reward-choice canvas') || !claimReward() || game.relics[0]!==1) return 'boss relic cards';
            if (game.round!==51 || game.phase!=='ready' || profile.essence!==1 || game.tickets[3]!==1 || document.getElementById('dialog').open)
                return 'uninterrupted normal transition';
            closeDialog();
            game.round=100; game.bossDefeated=true; game.bossRewarded=false; completeWave();
            if(!claimReward()) return 'normal reward';
            if (game.round!==101 || game.phase!=='ready' || profile.essence!==2 || document.getElementById('dialog').open)
                return 'uninterrupted hard transition';
            closeDialog();
            game.round=150; game.bossDefeated=true; game.bossRewarded=false; game.played=3723; completeWave();
            if(!claimReward()) return 'hard reward';
            Math.random=originalRandom;
            if (game.phase!=='over' || profile.essence!==3 || profile.runs[0].seconds!==3723 ||
                !document.getElementById('dialogBody').textContent.includes('01:02:03')) return 'hard finish record';
            showRecords();
            if(!document.getElementById('dialogBody').textContent.includes('01:02:03')) return 'record history';
            closeDialog();
            profile.essence=45;
            legacy();
            for(let i=0;i<3;i++) document.querySelectorAll('.research-branch')[0].querySelectorAll('button')[i].click();
            for(let i=0;i<3;i++) document.querySelectorAll('.research-branch')[1].querySelectorAll('button')[i].click();
            if (researchedCount()!==6 || !document.querySelectorAll('.research-branch')[2].querySelector('button').disabled) return 'research cap';
            advance('연구 초기화');
            advance('초기화 후 재분배');
            if (researchedCount()!==0 || profile.essence!==45) return 'research refund';
            beginGame();
            game.round=50;startWave();game.bossTime=.01;
            const points=profile.essence;
            step(1/30);
            if(game.round!==51 || game.phase!=='wave' || profile.essence!==points || document.getElementById('dialog').open)
                return 'timeout automatic wave';
            beginGame();
            game.round=150;startWave();game.bossTime=.01;step(1/30);
            if(game.phase!=='over' || profile.runs[0].result!=='timeout' || profile.essence!==points) return 'timeout final record';
            beginGame();
            queueMission(0);
            if(!game.active[0].queued || activeMissions.length!==7) return 'manual mission queue';
            startWave();step(1/30);
            const elite=game.enemies.find(enemy=>enemy.challenge===0);
            if(!elite) return 'elite spawned';
            elite.hp=0;step(1/30);queueMission(0);
            if(!game.active[0].auto || game.active[0].clears!==1) return 'mission auto enabled';
            game.active[0].wait=0;step(1/30);
            if(!game.enemies.some(enemy=>enemy.challenge===0)) return 'mission auto respawn';
            queueMission(0);
            if(game.active[0].auto || game.active[0].armed) return 'mission auto disabled';
            profile.pulse=1;useResearchSkill();
            if(!game.pulseUsed || game.enemies.some(enemy=>enemy.slow<2.5)) return 'research pulse';
            profile.pulse=0;
            beginGame();
            const pressExtra=code=>document.body.dispatchEvent(new KeyboardEvent('keydown',{code,bubbles:true,cancelable:true}));
            game.board[0]=recipeTower(1,0);chooseCell(0);pressExtra('KeyF');
            if(!game.expedition.unit || game.board[0] || canDraw()) return 'expedition transfer';
            const eventHp=game.expedition.hp;
            step(1/30);
            if(game.expedition.hp!==eventHp) return 'expedition damage in prep';
            game.phase='wave';
            for(let tick=0;tick<2100;tick++) stepExpedition(1/30);
            if(game.expedition.index!==0 || game.expedition.hp>=eventHp*.62) return 'uncapped expedition damage';
            for(let tick=0;tick<1000;tick++) stepExpedition(1/30);
            if(boardUnitScale!==3 || boardCanvas.width!==6120 || boardCanvas.height!==6120 ||
                groundCanvas.width!==boardCanvas.width || getComputedStyle(groundCanvas).pointerEvents!=='none')
                return '6120-pixel layered board';
            if(game.expedition.index!==1 || profile.essence!==points+1) return 'expedition boss reward';
            pressExtra('KeyG');
            if(!game.board[0] || game.expedition.unit) return 'expedition recall';
            for(const star of [1,2,3]) for(let id=0;id<families.length;id++) recordAcquisition(recipeTower(star,id));
            if(game.tickets[1]!==2 || game.tickets[2]!==1 || game.tickets[3]!==1) return 'passive collections';
            game.board[1]=recipeTower(4,0);game.board[2]=recipeTower(3,1);
            const beforeFormation=game.gold;
            checkFormations();checkFormations();
            if(game.gold!==beforeFormation+55 || !game.passiveDone.has(0)) return 'single formation payout';
            beginGame();
            Math.random=()=>.999;
            offerRelics(10,()=>{game.phase='ready';});
            const ticketCards=[...document.querySelectorAll('.reward-choice')];
            if(ticketCards.length!==3 || !ticketCards.every(card=>card.dataset.reward==='ticket') ||
                !ticketCards[0].classList.contains('gold')) return 'duplicate reward categories';
            ticketCards[0].click();
            if(game.tickets[3]!==1) return 'draft ticket grant';
            Math.random=()=>.55;
            offerRelics(20,()=>{game.phase='ready';});
            const goldCard=document.querySelector('.reward-choice[data-reward=gold]');
            if(!goldCard) return 'gold card';
            const beforeDraft=game.gold;goldCard.click();
            if(game.gold<=beforeDraft) return 'draft gold grant';
            Math.random=originalRandom;
            beginGame();
            renderUI();
            if (cells.length !== 61 || game.board.length !== cells.length || blocks.length !== 9 ||
                new Set(blocks.map(block=>block.columns+'x'+block.rows)).size !== 4) return 'varied board layout';
            const centersX=[2.15,5.925,9.775,2.1625,5.925,9.7625,2.175,5.925,9.75];
            const centersY=[2.15,2.15,2.15,5.925,5.925,5.925,9.75,9.7625,9.775];
            for(let i=0;i<blocks.length;i++) {
                const plot=cells.filter(cell=>cell.block===i+1);
                const mean=key=>plot.reduce((sum,cell)=>sum+cell[key],0)/plot.length;
                if(Math.abs(mean('x')-centersX[i])>1e-9 || Math.abs(mean('y')-centersY[i])>1e-9) return 'plot centering';
            }
            if (bossTicketTier(10)!==1 || bossTicketTier(20)!==2 || bossTicketTier(50)!==3 ||
                missionTicketTier(7)!==1 || missionTicketTier(28)!==2 || missionTicketTier(77)!==3) return 'ticket tiers';
            game.round=28;startWave();
            game.enemies.push({hp:0,type:'mission',mission:true,x:1,y:1});
            step(1/30);
            if(game.missionKills!==1 || game.tickets[2]!==1) return 'mission award';
            beginGame();
            awardTicket(2);
            openTicket(2);
            advance('취소');
            if(game.tickets[2]!==1) return 'cancelled ticket';
            openTicket(2);
            document.querySelector('#dialogBody button').click();
            if(game.tickets[2]!==0 || game.reserve[0]?.star!==2 || isSpecial(2,game.reserve[0].identity)) return 'redeemed ticket';
            const random = Math.random;
            Math.random = ()=>.2;
            game.gold=100;
            gamble();
            if(game.gold!==75 || game.gambleResult!=='영혼 5') return 'gold gamble';
            Math.random = ()=>.99;
            gamble();
            if(game.gold!==45 || game.tickets[3]!==1) return 'ticket gamble';
            Math.random = ()=>.999;
            gamble();
            Math.random = random;
            if(game.gold!==15 || !game.reserve.some(unit=>unit.star===3 && isSpecial(unit.star,unit.identity))) return 'rare gamble';
            for(const [star,identity] of [[6,specialIdentity(6)],[7,specialIdentity(7)],[7,specialIdentity(7)+1]]) {
                const slots=requirements(star,identity);
                if(slots.filter(([rank])=>rank===0).length!==1) return 'one special per recipe';
                game.board.fill(null);
                const required=slots[0][1];
                slots.slice(1).forEach(([rank,id],i)=>{game.board[i+1]=recipeTower(rank,id);});
                game.board[0]=recipeTower(2,required===specialIdentity(2)?required+1:specialIdentity(2));
                if(recipeMatch(star,identity)) return 'wrong special accepted';
                game.board[0]=recipeTower(star===6?1:3,required);
                const match=recipeMatch(star,identity);
                if(!match || match.filter(index=>isSpecial(game.board[index].star,game.board[index].identity)).length!==1) return 'special recipe match';
                combine(match,recipeTower(star,identity));
                if(game.board[0]?.identity!==identity || game.board[0]?.star!==star) return 'special result';
            }
            beginGame(); renderUI();
            const initialGold = game.gold;
            draw();
            if (game.gold !== initialGold || !document.getElementById('draw').disabled) return 'unselected draw';
            chooseCell(0); draw();
            const first = game.board[0];
            const afterFirst = game.gold;
            draw();
            if (game.board[0] !== first || game.gold !== afterFirst || game.reserve.length) return 'occupied draw';
            renderUI();
            const sale = document.querySelector('.sell');
            if (sale.textContent !== '판매 · 영혼 13') return 'sale label';
            sale.click();
            if (game.board[0] || game.gold !== afterFirst + 13 || game.selected !== 0) return 'one-star sale';

            for (let i = 0; i < 4; i++) { chooseCell(i); draw(); }
            combine([0,1],tower(2,0));
            if (refund(game.board[0]) !== 26) return 'two-star sale';
            combine([2,3],tower(2,0));
            chooseCell(0);
            combine([0,2],tower(3,0));
            const beforeThree = game.gold;
            sellTower(0);
            if (game.board[0] || game.gold !== beforeThree + 52) return 'three-star sale';
            addUnit(tower(1,0));
            game.pick = game.reserve[0];
            chooseCell(0);
            const beforeReward = game.gold;
            sellTower(0);
            if (game.gold !== beforeReward || game.board[0] || game.reserve.length) return 'reward sale';
            for (const star of [4,5,6,7]) {
                const unit=tower(star,0);
                unit.spent=100;
                game.board[0]=unit;
                const beforeSale=game.gold;
                sellTower(0);
                if (star<=5 ? game.board[0] || game.gold!==beforeSale+65 :
                    game.board[0]!==unit || game.gold!==beforeSale) return star+'-star sale';
            }
            reset();
            const press = (code, options = {}) => document.body.dispatchEvent(new KeyboardEvent('keydown',
                {code, key:code.slice(-1).toLowerCase(), bubbles:true, cancelable:true, ...options}));
            if (document.getElementById('summonPanel').open || document.getElementById('towerPanel').open) {
                renderUI();
                if (document.getElementById('summonPanel').open || document.getElementById('towerPanel').open) return 'collapsed panels';
            }
            chooseCell(4);
            press('KeyQ', {repeat:true});
            if (game.board[4]) return 'repeated purchase';
            press('KeyQ');
            renderUI();
            if (!game.board[4] || document.getElementById('towerPanel').open ||
                !document.getElementById('unitStats').querySelector('canvas')) return 'purchase shortcut or inspector';
            press('KeyE');
            if (game.board[4]) return 'sell shortcut';
            addUnit(tower(2,0));
            press('KeyW');
            if (game.board[4]?.star !== 2 || game.reserve.length) return 'placement shortcut';
            game.board[5] = tower(2,1);
            game.board[6] = tower(2,0);
            startWave();
            press('KeyR');
            if (game.board[4]?.star !== 2 || game.mergeSource !== 4) return 'merge selection';
            chooseCell(5);
            if (game.board[4]?.star !== 2 || game.mergeSource !== 4 || !game.board[5]) return 'different demon merge';
            chooseCell(6);
            if (game.board[4]?.star !== 3 || game.board[4].role !== 0 || game.board[6] || !game.board[5]) return 'wave merge';
            renderUI();
            if (document.getElementById('towerPanel').open) return 'merge opened inspector';
            document.getElementById('towerPanel').querySelector('summary').click();
            if (document.querySelectorAll('#unitStats .unit-skill').length !== 1) return 'low-rank skill count';
            document.querySelector('#unitStats .range-button').click();
            if (game.skillPreview?.range !== 'attack') return 'skill range switch';
            document.getElementById('summonPanel').open = true;
            if (document.getElementById('towerPanel').open) return 'exclusive panels';
            if (recipeButtons.get(5).filter(Boolean).length !== 6 || recipeButtons.get(6).length !== 8 ||
                recipeButtons.get(7).length !== 9) return 'regular and special recipes';
            game.board[1]=recipeTower(4,5);game.board[2]=recipeTower(4,5);
            chooseCell(1);press('KeyR');chooseCell(2);
            if(game.board[1]?.star!==5 || game.board[1]?.identity!==5 || game.board[2]) return 'ordinary five-star merge';
            for(let identity=0;identity<sins.length;identity++)
                if(!requirements(7,identity).some(([rank,material])=>rank===6 && material===identity)) return 'sin ancestry';
            for (const [star,role] of [[5,families.length],[6,0],[7,0],[7,6]]) {
                const {row,progress,materials} = recipeButtons.get(star)[role];
                if (!row.querySelector('canvas') || row.classList.contains('crafted')) return 'initial silhouette';
                const needs = requirements(star,role);
                game.board.fill(null);
                const [tier,type] = needs[0];
                game.board[0] = recipeTower(tier,type);
                renderUI();
                if (!progress.textContent.includes('33%') || !materials[0].classList.contains('available') ||
                    materials[1].classList.contains('available')) return 'partial recipe progress';
                needs.forEach(([tier,type],i)=>{game.board[i]=recipeTower(tier,type);});
                renderUI();
                if (!progress.textContent.includes('100%')) return 'complete recipe progress';
                recipeButtons.get(star)[role].action.click();
                if (!crafted.has(recipeKey(star,role))) {
                    renderUI();
                    recipeButtons.get(star)[role].action.click();
                }
                renderUI();
                const saved = JSON.parse(localStorage.getItem('ashen-citadel-profile'));
                if (!row.classList.contains('crafted') || !saved.crafted.includes(recipeKey(star,role)) ||
                    !game.shots.some(shot=>shot.effect==='craft' && shot.star===star)) return 'craft animation or history';
                if (game.board[game.selected]?.identity !== role) return 'recipe identity';
                if (document.querySelectorAll('#unitStats .unit-skill').length !== (star===7?3:2)) return 'high-rank skill count';
            }
            reset();
            addUnit(tower(2,0));
            addUnit(tower(3,1));
            chooseCell(4);
            const rewardGold = game.gold;
            press('KeyQ');
            if (game.board[4]?.star !== 2 || game.gold !== rewardGold || game.reserve.length !== 1) return 'priority reward';
            chooseCell(5);
            press('KeyQ');
            chooseCell(6);
            press('KeyQ');
            if (game.board[5]?.star !== 3 || game.board[6]?.spent !== 20 || game.reserve.length ||
                game.gold !== rewardGold) return 'random after reward';
            reset();
            renderUI();
            if (!recipeButtons.get(7)[0].row.classList.contains('crafted') || !discovered.has('7:0')) return 'craft history after reset';
            game.round=130;game.gold=100;
            chooseCell(12);
            Math.random=()=>.999;
            draw();Math.random=originalRandom;
            if(game.board[12]?.star!==5 || game.board[12]?.identity!==10) return 'late five-star random draw';
            const swift={type:'swift',slow:0};
            const speed=enemySpeed(swift,150);
            if(speed>6.15 || speed<=enemySpeed(swift,1)) return 'progressive speed cap';
            swift.slow=1;
            if(enemySpeed(swift,150)>=speed) return 'slow combat control';
            reset();
            game.board[0]=recipeTower(4,10);chooseCell(0);
            startWave();game.nextSpawn=10;
            const dummy=progress=>({...position(progress),progress,hp:1000,max:1000,shield:0,type:'normal',slow:0,stun:0,curse:0});
            const a=dummy(.6),b=dummy(.9);
            game.enemies.push(a,b);
            step(1/30);
            if(game.board[0]?.role!==5 || a.hp>=1000 || b.hp>=1000 || a.slow<=0 || b.slow<=0) return 'all-rounder splash and slow';
            reset();
            document.getElementById('summonPanel').open = true;

            const canvas = document.getElementById('board');
            const rect = canvas.getBoundingClientRect();
            const firstCell = cells[0];
            const p = project(firstCell.x, firstCell.y);
            canvas.dispatchEvent(new PointerEvent('pointerup', {
                clientX: rect.left + p.x * rect.width / boardWidth,
                clientY: rect.top + p.y * rect.height / boardHeight
            }));
            renderUI();
            return game.selected === 0 && !document.getElementById('draw').disabled ? 'ok' : 'canvas selection';
        })()");
        if (sales != "\"ok\"") throw new InvalidOperationException("소환 및 판매 규칙 확인 실패: " + sales);
        string input = await view.ExecuteScriptAsync(@"(() => {
            const rect = document.getElementById('draw').getBoundingClientRect();
            return Math.round(rect.left + rect.width / 2) + ',' + Math.round(rect.top + rect.height / 2);
        })()");
        string[] location = input.Trim('"').Split(',');
        string click = "\"button\":\"left\",\"clickCount\":1,\"x\":" + location[0] + ",\"y\":" + location[1];
        await view.CoreWebView2.CallDevToolsProtocolMethodAsync("Input.dispatchMouseEvent", "{\"type\":\"mousePressed\"," + click + "}");
        await view.CoreWebView2.CallDevToolsProtocolMethodAsync("Input.dispatchMouseEvent", "{\"type\":\"mouseReleased\"," + click + "}");
        string start = await view.ExecuteScriptAsync(@"(() => {
            const select = document.getElementById('speed');
            select.value = '3';
            select.dispatchEvent(new Event('change'));
            const codex = document.getElementById('codexUnit');
            codex.value = '2:7';
            codex.dispatchEvent(new Event('change'));
            const portraits = new Set();
            for (let star = 1; star <= maxStar; star++) for (let identity=0; identity<identityCount(star); identity++) {
                const portrait = document.createElement('canvas');
                portrait.width = 48; portrait.height = 48;
                drawDemon(portrait.getContext('2d'), recipeTower(star,identity), 24, 41, 2);
                portraits.add(portrait.toDataURL());
            }
            document.getElementById('wave').click();
            const first = game.board[0];
            sellTower(0);
            if (game.board[0] !== first || !first) return false;
            chooseCell(1);
            draw();
            chooseCell(0);
            const canvas = document.getElementById('board');
            const rect = canvas.getBoundingClientRect();
            const p = project(cells[0].x,cells[0].y);
            canvas.dispatchEvent(new PointerEvent('pointermove', {
                clientX:rect.left+p.x*rect.width/boardWidth,
                clientY:rect.top+p.y*rect.height/boardHeight
            }));
            if (document.getElementById('towerTooltip').hidden ||
                document.getElementById('towerTooltip').textContent !== unitName(first)) return false;
            localStorage.setItem('desktop-test','ok');
            return Boolean(game.board[1]?.spent === 20 && !game.reserve.length
                && game.phase === 'wave' && localStorage.getItem('desktop-test') === 'ok'
                && game.speed === 3 && !select.options[1].disabled && !select.options[2].disabled
                && portraits.size >= 75 && project(1,0).y === project(0,0).y && project(0,1).x === project(0,0).x);
        })()");
        if (start != "true") throw new InvalidOperationException("배치, 3배속, 평면 전장, 도트 초상 또는 저장 확인 실패: " + start);
        await Task.Delay(1600);
        string progress = await view.ExecuteScriptAsync(@"Boolean((game.kills > 0 || game.enemies.some(enemy => enemy.progress > 0))
            && audio?.state === 'running' && nextSound > 0 &&
            document.getElementById('codexStats').textContent.includes('48%') &&
            JSON.parse(localStorage.getItem('ashen-citadel-profile')).encounters.includes('normal') &&
            document.getElementById('unitStats').textContent.includes('기본 DPS'))");
        if (progress != "true") throw new InvalidOperationException("전투, 효과음 또는 스킬 UI를 확인하지 못했습니다: " + progress);
        string paused = await view.ExecuteScriptAsync(@"(() => {
            const wave = document.getElementById('wave');
            if (wave.textContent !== '정지') return 'stop button';
            wave.click(); renderUI();
            if (!game.paused || wave.textContent !== '웨이브 시작') return 'pause';
            game.shots.push({to:cells[0],effect:'hit',role:0,time:.20});
            return 'ok';
        })()");
        if (paused != "\"ok\"") throw new InvalidOperationException("웨이브 정지 확인 실패: " + paused);
        await Task.Delay(450);
        string resumed = await view.ExecuteScriptAsync(@"(() => {
            if (game.shots.length || !game.paused) return 'effect while paused';
            document.getElementById('wave').click();
            if (game.paused || game.phase!=='wave') return 'resume';
            completeWave();
            game.shots.push({to:cells[0],effect:'hit',role:0,time:.20});
            return 'ok';
        })()");
        if (resumed != "\"ok\"") throw new InvalidOperationException("웨이브 재개 확인 실패: " + resumed);
        await Task.Delay(450);
        string cameraPosition = await view.ExecuteScriptAsync(@"(() => {
            if (game.shots.length || game.phase!=='ready') return 'effect after wave';
            const box = boardCanvas.getBoundingClientRect();
            const x = Math.round(box.left + box.width/2), y = Math.round(box.top + box.height/2);
            for (let i=0;i<3;i++) map.dispatchEvent(new WheelEvent('wheel',{ctrlKey:true,cancelable:true,deltaY:-100,clientX:x,clientY:y}));
            if (camera.zoom<=1 || !map.classList.contains('zoomed')) return 'wheel zoom';
            window.smokeCamera = {x:camera.x,y:camera.y,selected:game.selected};
            window.smokeEvents = [];
            for (const type of ['pointerdown','pointermove','pointerup','pointercancel','lostpointercapture'])
                document.addEventListener(type,event=>smokeEvents.push([type,event.target.id,event.clientX,event.clientY,event.isPrimary]),true);
            return 'ok,'+x+','+y;
        })()");
        string[] cameraCoordinates = cameraPosition.Trim('"').Split(',');
        if (cameraCoordinates[0] != "ok") throw new InvalidOperationException("이펙트 제거 또는 확대 확인 실패: " + cameraPosition);
        int dragX = Int32.Parse(cameraCoordinates[1]), dragY = Int32.Parse(cameraCoordinates[2]);
        string down = ",\"button\":\"left\",\"buttons\":1,\"clickCount\":1,\"x\":" + dragX + ",\"y\":" + dragY + "}";
        string move = ",\"x\":" + (dragX + 80) + ",\"y\":" + (dragY + 55);
        await view.CoreWebView2.CallDevToolsProtocolMethodAsync("Input.dispatchMouseEvent", "{\"type\":\"mousePressed\"" + down);
        await Task.Delay(60);
        await view.CoreWebView2.CallDevToolsProtocolMethodAsync("Input.dispatchMouseEvent", "{\"type\":\"mouseMoved\",\"buttons\":1" + move + "}");
        for(int attempt=0;attempt<5;attempt++)
        {
            await Task.Delay(50);
            if(await view.ExecuteScriptAsync("Boolean(camera.drag?.moved)")=="true") break;
        }
        await view.CoreWebView2.CallDevToolsProtocolMethodAsync("Input.dispatchMouseEvent", "{\"type\":\"mouseReleased\",\"button\":\"left\",\"clickCount\":1" + move + "}");
        string panned = await view.ExecuteScriptAsync(@"Boolean((camera.x !== smokeCamera.x || camera.y !== smokeCamera.y)
            && !camera.drag && game.selected === smokeCamera.selected)");
        if (panned != "true")
        {
            string details = await view.ExecuteScriptAsync("({events:smokeEvents,current:[camera.x,camera.y,game.selected],before:smokeCamera})");
            throw new InvalidOperationException("확대 후 드래그 확인 실패: " + details);
        }
        await view.ExecuteScriptAsync(@"camera.zoom=1; updateCamera();
            for (let i=0;i<7;i++) game.board[3+i*8]=recipeTower(7,i);
            game.enemies.push({...position(16),hp:75,max:100,boss:true,progress:16,stun:0,slow:0});
            chooseCell(51); renderUI(); paintBoard(performance.now());");
        using (var screenshot = File.Create(Path.ChangeExtension(report, ".png")))
            await view.CoreWebView2.CapturePreviewAsync(CoreWebView2CapturePreviewImageFormat.Png, screenshot);
        File.WriteAllText(report, "PASS: boss clock and automatic transition, no 50/100 confirmation, mission cycle, collections and formation rewards, expedition F/G, boss points, combat research, records and rotating title gems; prior gameplay verified.");
        Close();
    }

    private void Fail(Exception error)
    {
        ExitCode = 1;
        Program.ReportError(error, report);
        Close();
    }
}
