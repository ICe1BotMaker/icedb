const FilSystem = require('fs');

String.prototype.isString = function() {
    if (this.startsWith(`'`) && this.endsWith(`'`)) return true;
    return false;
}

let icedbData;

const icedb = {
    localPath: ``,

    setPath: (path = String) => {
        icedb.localPath = path;
    },

    createDatabase: (dbname = String) => {
        FilSystem.writeFileSync(`${icedb.localPath}/${dbname}.json`, JSON.stringify({}, null, 4));
        
        icedbData = JSON.parse(FilSystem.readFileSync(`${icedb.localPath}/${dbname}.json`));
    },
    removeDatabase: (dbname = String) => {
        FilSystem.unlinkSync(`${icedb.localPath}/${dbname}.json`);
    },

    createTable: (dbname = String, { tablename = String }) => {
        icedbData[tablename] = { data: [] };
        FilSystem.writeFileSync(`${icedb.localPath}/${dbname}.json`, JSON.stringify(icedbData, null, 4));
    },
    removeTable: (dbname = String, { tablename = String }) => {
        delete icedbData[tablename];
        FilSystem.writeFileSync(`${icedb.localPath}/${dbname}.json`, JSON.stringify(icedbData, null, 4));
    },

    addItem: (dbname = String, { tablename = String, data }) => {
        icedbData[tablename].data.push(data);
        FilSystem.writeFileSync(`${icedb.localPath}/${dbname}.json`, JSON.stringify(icedbData, null, 4));
    },
    getItem: (dbname = String, { tablename = String, idx = Number }) => {
        return icedbData[tablename].data[idx];
    },
    removeItem: (dbname = String, { tablename = String, idx = Number }) => {
        delete icedbData[tablename].data[idx];
        FilSystem.writeFileSync(`${icedb.localPath}/${dbname}.json`, JSON.stringify(icedbData, null, 4));
    },
    
    query: (query = String) => {
        let result = [];

        const line = query.split(`\n`);
    
        line.forEach((line, lineIdx) => {
            if (line.startsWith(`#`)) return;

            if (!line.endsWith(`;`) && line.trim() != ``) {
                throw new Error(`Grammatical Error: After line, ';' must come.`);
            }

            line = line.substring(0, line.length - 1);

            const gap = line.split(` `);
        
            gap.forEach((e, idx) => {
                if (e == `SET`) {
                    if (gap[idx + 1] != `PATH`) {
                        throw new Error(`Grammatical Error: After 'SET', 'PATH' must come.`);
                    }
        
                    if (gap[idx + 2].isString()) {
                        icedb.setPath(gap[idx + 2].replace(/'/g, ``));
                    } else {
                        throw new Error(`Grammatical Error: After 'SET PATH', string must come.`);
                    }
                }
        
                else if (e == `CREATE`) {
                    if (![`DATABASE`, `TABLE`, `ITEM`].includes(gap[idx + 1])) {
                        throw new Error(`Grammatical Error: After 'CREATE', one of 'DATABASE', 'TABLE', and 'ITEM' must come.`);
                    }
                    
                    if (gap[idx + 1] == `DATABASE`) {
                        if (gap[idx + 2].isString()) {
                            icedb.createDatabase(gap[idx + 2].replace(/'/g, ``));
                        } else {
                            throw new Error(`Grammatical Error: After 'CREATE ${gap[idx + 1]}', string must come.`);
                        }
                    }
                    
                    if (gap[idx + 1] == `TABLE`) {
                        if (gap[idx + 2].isString()) {
                            if (gap[idx + 3] == `=>`) {
                                if (gap[idx + 4].isString()) {
                                    icedb.createTable(gap[idx + 2].replace(/'/g, ``), {
                                        tablename: gap[idx + 4].replace(/'/g, ``)
                                    });
                                } else {
                                    throw new Error(`Grammatical Error: After 'CREATE ${gap[idx + 1]} ${gap[idx + 2]} ${gap[idx + 3]}', string must come.`);
                                }
                            } else {
                                throw new Error(`Grammatical Error: After 'CREATE ${gap[idx + 1]} ${gap[idx + 2]}', => must come.`);
                            }
                        } else {
                            throw new Error(`Grammatical Error: After 'CREATE ${gap[idx + 1]}', string must come.`);
                        }
                    }
                    
                    if (gap[idx + 1] == `ITEM`) {
                        if (gap[idx + 2].isString()) {
                            if (gap[idx + 3] == `=>`) {
                                if (gap[idx + 4].isString()) {
                                    if (gap[idx + 5] == `=>`) {
                                        if (gap[idx + 6].isString()) {
                                            icedb.addItem(gap[idx + 2].replace(/'/g, ``), {
                                                tablename: gap[idx + 4].replace(/'/g, ``),
                                                data: JSON.parse(gap[idx + 6].replace(/'/g, ``))
                                            });
                                        } else {
                                            throw new Error(`Grammatical Error: After 'CREATE ${gap[idx + 1]} ${gap[idx + 2]} ${gap[idx + 3]} ${gap[idx + 4]} ${gap[idx + 5]}', string must come.`);
                                        }
                                    } else {
                                        throw new Error(`Grammatical Error: After 'CREATE ${gap[idx + 1]} ${gap[idx + 2]}', => must come.`);
                                    }
                                } else {
                                    throw new Error(`Grammatical Error: After 'CREATE ${gap[idx + 1]} ${gap[idx + 2]} ${gap[idx + 3]}', string must come.`);
                                }
                            } else {
                                throw new Error(`Grammatical Error: After 'CREATE ${gap[idx + 1]} ${gap[idx + 2]}', => must come.`);
                            }
                        } else {
                            throw new Error(`Grammatical Error: After 'CREATE ${gap[idx + 1]}', string must come.`);
                        }
                    }
                }
        
                else if (e == `DELETE`) {
                    if (![`DATABASE`, `TABLE`, `ITEM`].includes(gap[idx + 1])) {
                        throw new Error(`Grammatical Error: After 'DELETE', one of 'DATABASE', 'TABLE', and 'ITEM' must come.`);
                    }
                    
                    if (gap[idx + 1] == `DATABASE`) {
                        if (gap[idx + 2].isString()) {
                            icedb.removeDatabase(gap[idx + 2].replace(/'/g, ``));
                        } else {
                            throw new Error(`Grammatical Error: After 'DELETE ${gap[idx + 1]}', string must come.`);
                        }
                    }
                    
                    if (gap[idx + 1] == `TABLE`) {
                        if (gap[idx + 2].isString()) {
                            if (gap[idx + 3] == `=>`) {
                                if (gap[idx + 4].isString()) {
                                    icedb.removeTable(gap[idx + 2].replace(/'/g, ``), {
                                        tablename: gap[idx + 4].replace(/'/g, ``)
                                    });
                                } else {
                                    throw new Error(`Grammatical Error: After 'DELETE ${gap[idx + 1]} ${gap[idx + 2]} ${gap[idx + 3]}', string must come.`);
                                }
                            } else {
                                throw new Error(`Grammatical Error: After 'DELETE ${gap[idx + 1]} ${gap[idx + 2]}', => must come.`);
                            }
                        } else {
                            throw new Error(`Grammatical Error: After 'DELETE ${gap[idx + 1]}', string must come.`);
                        }
                    }
                    
                    if (gap[idx + 1] == `ITEM`) {
                        if (gap[idx + 2].isString()) {
                            if (gap[idx + 3] == `=>`) {
                                if (gap[idx + 4].isString()) {
                                    if (gap[idx + 5] == `=>`) {
                                        if (!gap[idx + 6].isString()) {
                                            icedb.removeItem(gap[idx + 2].replace(/'/g, ``), {
                                                tablename: gap[idx + 4].replace(/'/g, ``),
                                                idx: gap[idx + 6]
                                            });
                                        } else {
                                            throw new Error(`Grammatical Error: After 'DELETE ${gap[idx + 1]} ${gap[idx + 2]} ${gap[idx + 3]} ${gap[idx + 4]} ${gap[idx + 5]}', number must come.`);
                                        }
                                    } else {
                                        throw new Error(`Grammatical Error: After 'DELETE ${gap[idx + 1]} ${gap[idx + 2]}', => must come.`);
                                    }
                                } else {
                                    throw new Error(`Grammatical Error: After 'DELETE ${gap[idx + 1]} ${gap[idx + 2]} ${gap[idx + 3]}', string must come.`);
                                }
                            } else {
                                throw new Error(`Grammatical Error: After 'DELETE ${gap[idx + 1]} ${gap[idx + 2]}', => must come.`);
                            }
                        } else {
                            throw new Error(`Grammatical Error: After 'DELETE ${gap[idx + 1]}', string must come.`);
                        }
                    }
                }

                else if (e == `GET`) {
                    if (gap[idx + 1] == `ITEM`) {
                        if (gap[idx + 2].isString()) {
                            if (gap[idx + 3] == `=>`) {
                                if (gap[idx + 4].isString()) {
                                    if (gap[idx + 5] == `=>`) {
                                        if (!gap[idx + 6].isString()) {
                                            result.push(icedb.getItem(gap[idx + 2].replace(/'/g, ``), {
                                                tablename: gap[idx + 4].replace(/'/g, ``),
                                                idx: gap[idx + 6]
                                            }));
                                        } else {
                                            throw new Error(`Grammatical Error: After 'DELETE ${gap[idx + 1]} ${gap[idx + 2]} ${gap[idx + 3]} ${gap[idx + 4]} ${gap[idx + 5]}', number must come.`);
                                        }
                                    } else {
                                        throw new Error(`Grammatical Error: After 'DELETE ${gap[idx + 1]} ${gap[idx + 2]}', => must come.`);
                                    }
                                } else {
                                    throw new Error(`Grammatical Error: After 'DELETE ${gap[idx + 1]} ${gap[idx + 2]} ${gap[idx + 3]}', string must come.`);
                                }
                            } else {
                                throw new Error(`Grammatical Error: After 'DELETE ${gap[idx + 1]} ${gap[idx + 2]}', => must come.`);
                            }
                        } else {
                            throw new Error(`Grammatical Error: After 'DELETE ${gap[idx + 1]}', string must come.`);
                        }
                    } else {
                        throw new Error(`Grammatical Error: After 'GET', 'ITEM' must come.`);
                    }
                }
            });
        });

        if (result.length != 0) {
            return result;
        }
    }
};


module.exports = { icedb };