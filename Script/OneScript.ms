(  
	global OneScript -- 开始脚本  
	struct OneScriptStruct(  
		TargetObj = undefined,          -- 目标对象
        InstanceObj = undefined,        -- 目标关联对象
        TargetV = undefined,            -- 外部文件版本
        MaxV = undefined,               -- 当前MAX版本
        OneFile = undefined,            -- 外部文件路径
        OneMergeObj = undefined,        -- 导入后的Obj 对象
        OnetempMat = undefined,         -- 临时材质
        OneMatType = undefined,         -- 材质渲染器类型
        OneIsmodels  = undefined,       -- 是否为场景模型       
        -- 获取版本
        fn getVersion v=(
            return ((v[1] - 2000) / 1000) + 2000
        ),
        fn setMergeObj xRef:false=(
            local OneObjects = for o in objects collect o
            if xRef then(
                local newNames = getMAXFileObjectNames OneScript.OneFile quiet:true
                local xreFile = xrefs.addNewXRefObject OneScript.OneFile newNames dupMtlNameAction:#autoRename
                if (maxVersion())[1] >= 18000 then
                for x in xreFile do(
                    local xc = x.transform.controller
                    if (classof xc == XRef_Controller)and(hasProperty xc #xrefCtrlStatus) then xc.xrefCtrlStatus = #Local
                )
            )else(
                mergeMAXFile OneScript.OneFile #mergeDups #renameMtlDups #noRedraw quiet:true
            )
            OneMergeObj = for o in objects where findItem OneObjects o == 0 collect o
        ),
        --  获取材质是否为丢失 未安装渲染器
        fn getMatIsMissMat mat =(
            mtls = getNumSubMtls mat
            info = false
            if mtls > 0 then(
                for i = 1 to mtls where getSubMtl mat i != undefined do(
                    SubMtl = getSubMtl mat i
                    if getNumSubMtls SubMtl > 0 then(
                        getMatIsMissMat SubMtl
                    )else(
                        if classOf SubMtl == Missing_Mtl do(
                            return true
                        )
                    )
                )
            )
            info
        ),
        fn matSetup = (
            local matPath = (for f in getfiles((getFilenamePath OneFile) + "\*.mat") where matchPattern (filenameFromPath f) pattern:(OneScript.OneMatType + "*") collect f)[1]
			--print OneScript.OneFile
			local status = true
			if matPath == undefined then(
				matV = getVersion (getMaxFileVersionData OneScript.OneFile)
				if matV > OneScript.MaxV then(
					status = queryBox ("当前版本是（" + matV as string + "）无法导入！\n是否继续？") title:"1号模型网" 
				)else(
					local assdata = getMAXFileAssetMetadata OneScript.OneFile
					for a in assdata do a.filename = getFilenamePath OneScript.OneFile + filenameFromPath a.filename 
					setMAXFileAssetMetadata OneScript.OneFile assdata
				)
			)else(
				matV = getVersion (getMaxFileVersionData matPath)
            
				if matV > OneScript.MaxV then(
					status = queryBox ("当前版本是（" + matV as string + "）无法导入！\n是否继续？") title:"1号模型网" 
				)else(
					local assdata = getMAXFileAssetMetadata matPath
					-- for a in assdata do a.filename = getFilenamePath matPath + "Maps\\" + filenameFromPath a.filename 
					for a in assdata do a.filename = getFilenamePath matPath + filenameFromPath a.filename 
					setMAXFileAssetMetadata matPath assdata
					mats = loadtempMaterialLibrary matPath
					for mat in mats do(
						if OneScript.getMatIsMissMat mat do return queryBox ("您未安装（" + OneScript.OneMatType + "）渲染器 无法导入材质！\n是否继续？") title:"1号模型网"  
					)
					OneScript.OnetempMat = mats
				)
			)
            return status
        ),
        -- 模型相关操作
        fn setMax MaxType:0 xRef:false =(
            if matSetup() then 
			
			fn setMatToSme mat =(
				if not SME.isOpen() do SME.open()
				newView = "未匹配材质" 
				if sme.GetViewByName newView > 0 then(
					index = sme.GetViewByName newView
				)else(
					index = sme.CreateView newView
				)
				sme.activeView = index
				View = sme.GetView(index)
				View.SelectAll()
				View.DeleteSelection()
				View.CreateNode mat [0,0]
				
			)
            case MaxType of(
                1:(
                    local RequSave = if getSaveRequired() then yesNoCancelBox "当前场景已修改!\n是否保存更改?" title:"1号模型网"
                    if RequSave != #cancel then(
                        if RequSave == #yes do max file save
                        loadMaxFile OneScript.OneFile useFileUnits:true quiet:true
						if OneScript.OnetempMat != undefined do(
							for obj in objects do(
								objRender =  getUserPropVal obj OneScript.OneMatType
								
								if objRender != undefined then(
									for mat in OneScript.OnetempMat do(
										if mat.name == a then(
											obj.mat = mat
										)else(
											setMatToSme mat 
										)
									)
								)else(
									obj.mat = OneScript.OnetempMat[1]
								)
							)
						)
                       
                    )
                )
                default:(
                    -- 合并文件
                    setMergeObj xRef:xRef
                    -- 关闭选中物体安全框
                    (NitrousGraphicsManager.getActiveViewportSetting()).ShowSelectionBracketsEnabled = false
                    -- 鼠标监听事件
                    tool PointCreator(
                        local maxFile = OneScript.OneMergeObj
                        local NewObjects =#()
                        local lasteObj = #()
                        fn firtObjs objs =(
                            return for o in objs where superClassOf o == GeometryClass or superClassOf o == light or superClassOf o == shape collect o
                        )
                        fn getMovePos objectSelction =(
                            if objectSelction.count > 0 do(
                                -- 计算选中对象的中心点位置
                                local center = [0, 0, 0]
                                local lowestObject = objectSelction[1]
                                for obj in objectSelction do(
                                    if obj.min.z < lowestObject.min.z then lowestObject = obj  
                                    center += obj.position
                                )
                                center /= objectSelction.count
                                -- 计算对象最低点落地
                                offset = [center.x,center.y,(center.z - (lowestObject.pos.z - lowestObject.min.z + (center.z - lowestObject.pivot.z)))]
                                move objectSelction (worldPoint - offset) 
                            )
                        )
						fn setMatToSme mat =(
							if not SME.isOpen() do SME.open()
							newView = "未匹配材质" 
							if sme.GetViewByName newView > 0 then(
								index = sme.GetViewByName newView
							)else(
								index = sme.CreateView newView
							)
							sme.activeView = index
							View = sme.GetView(index)
							View.SelectAll()
							View.DeleteSelection()
							View.CreateNode mat [0,0]
							
						)
                        on start do(
                            for obj in maxFile where superClassOf obj == GeometryClass or superClassOf obj == light or superClassOf obj == shape do(   
                                if obj.material == undefined then(
                                    -- 获取自定义渲染器信息
                                    objRender =  getUserPropVal obj OneScript.OneMatType
                                    if objRender != undefined then(
                                        for mat in OneScript.OnetempMat do(
                                            if mat.name == a then(
                                                obj.mat = mat
                                            )else(
                                                setMatToSme mat 
                                            )
                                        )
                                    )else(
                                        if OneScript.OnetempMat != undefined  do obj.mat = OneScript.OnetempMat[1]
                                    )
                                )
                            )
                        )
                        on freeMove do(
                            getMovePos(firtObjs maxFile)
                        )
                        on mouseMove clickno do(
                            getMovePos(firtObjs lasteObj)
                        )
                        on mousePoint clickno do(
                            if clickno == 1 do join newObjects maxFile
                            if clickno > 1 then(
                                maxOps.CloneNodes maxFile newNodes:&lasteObj cloneType:#instance
                                join newObjects lasteObj
                            )
                        )
                        on mouseAbort clickno do(
                            select newObjects
                            delete lasteObj
                            return #stop
                        )
                    )
                    startTool PointCreator
                )
            )
        ),
		-- 定义导入MAX文件右键菜单  
		MaxRCmenu =(  
			rcmenu MaxRCmenu(  
				menuItem mi_1 "打开文件"  
				menuItem mi_2 "合并文件"
                menuItem mi_3 "外部参照文件" 
				separator sep_0 
				menuItem mi_7 "取消"   
                on MaxRCmenu open do(
                    if OneIsmodels then(
                        mi_2.enabled = mi_3.enabled = false
                    )
                )
                on mi_1 picked do OneScript.setMax MaxType:1
                on mi_2 picked do OneScript.setMax xRef:false
                on mi_3 picked do OneScript.setMax xRef:true
			)  
		),
        -- 材质相关操作
        fn SetMat MenuType:0 newView:false =(
            if matSetup() then
            case MenuType of(
                1:(OneScript.TargetObj.material = OneScript.OnetempMat)
                2:(for o in OneScript.InstanceObj do o.material = OneScript.OnetempMat)
                3:(for s in selection do s.material = OneScript.OnetempMat)
                4:(
                    meditMaterials[1] = OneScript.OnetempMat
                    MatEditor.mode = #basic
                    MatEditor.Open()
                )
                5:(
                    meditMaterials[medit.GetActiveMtlSlot()] = OneScript.OnetempMat
                    MatEditor.mode = #basic
                    MatEditor.Open()
                )
                default:(
                    -- 切换并打开 Slete 材质编辑器
                    MatEditor.mode = #advanced 
                    sme.Open()
                    -- 获取当前 Slete 视图编号
                    local index = sme.activeView 
                    -- 设置窗口新名字
                    local NewName = "View" + (sme.GetNumViews() + 1) as string
                    -- 如果 newView 开启 或 视图编号为 0 时 则创建新窗口
                    if newView or index == 0 do index = sme.CreateView NewName
                    -- 获取当前窗口下所有的元素
                    local track = trackViewNodes[#sme][index]
                    -- 条件如果是材质 且 材质的名字等于 target 对象的材质名
                    local Oldmat = for i = 1 to track.numSubs where(superclassof track[i].reference == material and track[i].reference.name == OneScript.OnetempMat.name) collect track[i].reference
                    -- 锁定视口
                    local View = sme.GetView(index) 
                    -- 材质名字条件成立 且 不创建新窗口 直接获取成立的材质不创建新材质
                    if Oldmat.count > 0 and not newView then(
                        View.SetSelectedNodes Oldmat[1]
                        sme.SetMtlInParamEditor Oldmat[1]
                        View.ZoomExtents type:#selected
                    )else( -- 否则创建新材质
                        View.CreateNode OneScript.OnetempMat [0,track.numSubs * 300]
						View.SetSelectedNodes OneScript.OnetempMat
						sme.SetMtlInParamEditor OneScript.OnetempMat
						View.ZoomExtents type:#selected
                    )
                )
            )
        ),
        -- 定义导入Mat文件右键菜单
        MatRCmenu =(
            rcmenu MatRCmenu(  
                menuItem mi_1 "替换目标材质" enabled:false
                menuItem mi_2 "替换目标以及实例对象材质" enabled:false
                menuItem mi_3 "替换当前选择材质" enabled:false
                separator sep_0
                menuItem mi_4 "导入到 精简材质编辑器 第一个材质槽" 
				menuItem mi_5 "导入到 精简材质编辑器 当前选中材质槽" 
                separator sep_1
				menuItem mi_6 "导入到 Slate材质编辑器 在当前视口" 
				menuItem mi_7 "导入到 Slate材质编辑器 并创建新的视口" 
                separator sep_3
				menuItem mi_8 "取消"
                -- 当材质菜单被显示触发的操作
                on MatRCmenu open do(
                    if isValidNode OneScript.TargetObj then(
                        mi_1.enabled =  true
                        mi_1.text = "替换 (" + OneScript.TargetObj.name +") 材质"
                        if OneScript.InstanceObj.count > 1 then(
                            mi_2.enabled = true
                            mi_2.text = "替换 ("+ OneScript.TargetObj.name +") 以及实例对象材质"
                        )
                    )
                    if selection.count > 0 then mi_3.enabled = true
                )
                on mi_1 picked do OneScript.SetMat MenuType:1
                on mi_2 picked do OneScript.SetMat MenuType:2
                on mi_3 picked do OneScript.SetMat MenuType:3
                on mi_4 picked do OneScript.SetMat MenuType:4
                on mi_5 picked do OneScript.SetMat MenuType:5
                on mi_6 picked do OneScript.SetMat()
                on mi_7 picked do OneScript.SetMat newView:true
            )
        ),
        fn initializeStruct =(
            -- 处理版本问题
            if TargetV > MaxV then return messageBox ("当前文件版本是（" + TargetV as string + "）此版本MAX无法继续操作！") title:"1号模型网" icon:#warning
           
            
            local fileType = toLower (getFilenameType OneScript.OneFile)
            if fileType == (dotNetClass "System.Text.Encoding").UTF8.GetString #(46, 111, 110, 101) do return popUpMenu MaxRCmenu
            if fileType == (dotNetClass "System.Text.Encoding").UTF8.GetString #(46, 109, 97, 116) do return popUpMenu MatRCmenu
        ),
		-- 程序入口  
		fn Main dsFile:undefined target:undefined matType:false isModels:false =(  
            if not (doesFileExist dsFile) then return messageBox "项目文件丢失，请联系客服！" title:"1号模型网"
            -- 接收 target 对象 
			TargetObj = if isValidNode target then target else undefined
            -- 接收 Max文件路径
            OneFile = dsFile
            -- 获取 材质类型
            OneMatType = matType
            -- 获取模型类型
            OneIsmodels = isModels
            -- 获取 target 对象相关实例对象
            if TargetObj != undefined then InstanceMgr.GetInstances target &InstanceObj else undefined
			-- 获取 target 版本
            TargetV = getVersion (getMaxFileVersionData dsFile)
            -- 获取 max 版本
            MaxV = getVersion (maxVersion())
            -- 初始化操作
			initializeStruct()
		)  
		 
	)  
	OneScript = OneScriptStruct()  
) 
-- 结束脚本
